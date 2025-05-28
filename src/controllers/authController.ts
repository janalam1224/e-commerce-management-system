import { Request, Response, NextFunction } from 'express';
import { signupSchema, loginSchema } from '../schemas/schemas';
import admin from 'firebase-admin';
import { User } from '../types';

export const postSignup = async (req: Request, res: Response, next: NextFunction) => {
  const result = signupSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.errors
    });
  }

  const { name, email, password, userType } = result.data;

  try {
    
    const existingUser = await admin.auth().getUserByEmail(email).catch(() => null);
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const newUser = await admin.auth().createUser({
      email,
      password,
      displayName: name
    });

    await admin.firestore().collection('users').doc(newUser.uid).set({
      name,
      email,
      userType,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.status(201).json({
      message: "Signup successful",
      user: {
        uid: newUser.uid,
        name: newUser.displayName,
        email: newUser.email,
        userType
      }
    });

  } catch (error: any) {
    console.error("Error creating user:", error);
    return res.status(500).json({
      message: "Signup failed",
      error: error.message
    });
  }
};

//Auth Login
export const postLogin = async (req: Request, res: Response) => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.errors,
    });
  }

  const { email, password } = result.data;

  try {
    const firebaseRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    );

    const data = await firebaseRes.json();

    if (!firebaseRes.ok) {
      return res.status(401).json({ error: data.error?.message || 'Invalid credentials' });
    }

    res.status(200).json({ token: data.idToken });
  } catch {
    res.status(500).json({ error: 'Login failed. Please try again later.' });
  }
};


export const googleAuth = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const idToken = authHeader.split(" ")[1];

  try {
    // Verify ID token and decode
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, name, email, picture } = decodedToken;

    // Check if user exists in Firestore, if not, create them
    const userRef = admin.firestore().collection('users').doc(uid);
    const doc = await userRef.get();

    if (!doc.exists) {
      await userRef.set({
        name,
        email,
        userType: "user", // Or derive from elsewhere
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        provider: "google",
        picture
      });
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        uid,
        name,
        email,
        picture
      }
    });

  } catch (error) {
    console.error("Google Auth error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};