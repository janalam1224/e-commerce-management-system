import { Response } from 'express';
import { unifiedUserSchema, loginSchema } from '../schemas/schemas';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../../config/jwt';
import admin from 'firebase-admin';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, JwtPayload  } from '../types';

// Token generator
const generateToken = (payload: JwtPayload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

// SIGNUP
export const postSignup = async (req: AuthenticatedRequest, res: Response) => {
  const result = unifiedUserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: 'Validation failed', errors: result.error.errors });
  }

  const { firstName, lastName, email, password, role, status, telephone } = result.data;

  try {
    const userSnap = await admin.firestore().collection('users').where('email', '==', email.toLowerCase()).get();
    if (!userSnap.empty) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUserRef = admin.firestore().collection('users').doc();

    const newUser = {
      uid: newUserRef.id,
      fullName: `${firstName || ''} ${lastName || ''}`.trim(),
      email,
      password: hashedPassword,
      role,
      status: status || 'active',
      telephone,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await newUserRef.set(newUser);

    const token = generateToken({ uid: newUser.uid, email, role });

    return res.status(201).json({
      message: 'Signup successful',
      token,
      user: { uid: newUser.uid, email, fullName: newUser.fullName, role },
    });

  } catch (err: any) {
    return res.status(500).json({ message: 'Signup failed', error: err.message });
  }
};

// LOGIN
export const postLogin = async (req: AuthenticatedRequest, res: Response) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: 'Validation failed', errors: result.error.errors });
  }

  const { email: emailInRequest, password } = req.body;

  try {
    const snapshot = await admin.firestore()
        .collection('users')
        .where('email', '==', emailInRequest)
        .get();

    if (snapshot.empty) {
      return res.status(401).json( { 
          message: 'Invalid email or password' 
        }
      );
    }

    const userDoc: any = snapshot.docs[0];
    const { password: userPasswordInDB, id, email, role } = userDoc.data();

    const passwordMatch = await bcrypt.compare(password, userPasswordInDB);
    if (!passwordMatch) {
      return res.status(401).json({ 
          message: 'Invalid email or  password'
        }
      );
    }

    const tokenData = {
      uid: id,
      email,
      role
    };
    const token = generateToken(tokenData);

    return res.status(200).json({ token });
  } catch (err: any) {
    return res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// GOOGLE AUTH
export const googleAuth = async (req: AuthenticatedRequest, res: Response) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const idToken = authHeader.split(' ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, name, email, picture } = decodedToken;

    const userRef = admin.firestore().collection('users').doc(uid);
    const doc = await userRef.get();

    if (!doc.exists) {
      await userRef.set({
        fullName: name || '',
        email,
        role: 'customer',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        provider: 'google',
        picture,
      });
    }

    return res.status(200).json({
      message: 'Login successful',
      user: { uid, fullName: name || '', email, picture },
    });

  } catch (error) {
    console.error('Google Auth error:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// RESET PASSWORD EMAIL
export const resetPassword = async (req: AuthenticatedRequest, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const firebaseRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${process.env.FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestType: 'PASSWORD_RESET',
          email,
          continueUrl: 'http://localhost:3000/auth/reset-password',
        }),
      }
    );

    const data = await firebaseRes.json();

    if (!firebaseRes.ok) {
      return res.status(400).json({ message: data.error?.message || 'Failed to send reset email' });
    }

    return res.status(200).json({ message: 'Password reset email sent successfully' });

  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'Failed to send password reset email' });
  }
};

// VALIDATE RESET LINK
export const getSetPassword = (req: AuthenticatedRequest, res: Response) => {
  const { oobCode, mode } = req.query;

  if (mode !== 'resetPassword' || !oobCode) {
    return res.status(400).send('Invalid password reset link.');
  }

  return res.status(200).send('Reset link verified. You may now reset your password.');
};

// SET NEW PASSWORD
export const postSetPassword = async (req: AuthenticatedRequest, res: Response) => {
  const { oobCode, newPassword } = req.body;

  if (!oobCode || !newPassword) {
    return res.status(400).send('Missing reset code or new password.');
  }

  try {
    const firebaseRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=${process.env.FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oobCode, newPassword }),
      }
    );

    const data = await firebaseRes.json();

    if (!firebaseRes.ok) {
      return res.status(400).send(`Error: ${data.error?.message || 'Password reset failed'}`);
    }

    return res.send('Your password has been successfully reset.');

  } catch (error) {
    console.error('Password reset confirmation error:', error);
    return res.status(500).send('Internal server error.');
  }
};
