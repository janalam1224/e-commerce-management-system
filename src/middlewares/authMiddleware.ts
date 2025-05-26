import { Request, Response, NextFunction } from "express";

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;

  if (token === "mysecrettoken") {
    next();
  } else {
    res.status(403).json({ message: "Unauthorized" });
  }
};