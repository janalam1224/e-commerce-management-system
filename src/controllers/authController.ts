import { Request, Response, NextFunction } from 'express';
import { signupSchema, loginSchema } from '../schemas/schemas';
import usersJson from '../data/user.json';
import fs from 'fs';
import path from 'path';
import { User } from '../types';

const usersPath = path.join(__dirname, '../data/user.json');
const users: User[] = usersJson;

export const postSignup = async (req: Request, res: Response, next: NextFunction) => {
  const result = signupSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.errors
    });
  }

  const { name, email, password, userType } = result.data;

  const userExists = users.find(user => user.email === email);
  if (userExists) {
    return res.status(409).json({ message: "User already exists" });
  }

  const newUser: User = {
    id: users.length + 1,
    name,
    email,
    password,
    userType
  };

  users.push(newUser);

  fs.writeFile(usersPath, JSON.stringify(users), err => {
    console.log(err);
  });

  return res.status(201).json({
    message: "Signup successful",
    user: newUser
  });
};


export const postLogin = async(req: Request, res: Response, next: NextFunction) => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.errors
    });
  }

  const { email, password } = result.data;

  const validUser = users.find(
    user => user.email === email && user.password === password
  );

  if (validUser) {
    return res.status(200).json({
      message: "Login Successful",
      token: "mysecrettoken",
      userType: validUser.userType
    });
  } else {
    return res.status(401).json({ message: "Invalid Credentials" });
  }
};