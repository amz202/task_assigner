import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || "mysecretkey";

export interface AuthRequest extends Request {
  user?: any;
}

const validateToken = (req: AuthRequest, res: Response, next: NextFunction) => {

  const token = req.cookies?.jwt;

  if (!token) {
     res.status(401).json({ message: 'Access token missing' });
     return
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next(); 
  } catch (err) {
     res.status(403).json({ message: 'Invalid or expired token' });
     return
  }
};

export default validateToken;
