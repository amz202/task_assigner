import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../data/db';
import { eq  } from 'drizzle-orm';
import { UserTable } from '../data/schema';

const secret = process.env.JWT_SECRET || "mysecretkey";

export interface AuthRequest extends Request {
  user?: any;
}

const validateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {

  const token = req.cookies?.jwt;

  if (!token) {
     res.status(401).json({ message: 'Access token missing' });
     return
  }

  try {
      

    const decoded = jwt.verify(token, secret);
    const {userId} = decoded as { userId: number };
      const user = await db
      .select({
      id: UserTable.id,
      name: UserTable.name,
      email: UserTable.email,
      role: UserTable.role,
      is_approved: UserTable.isApproved,
      created_at: UserTable.createdAt,
      updated_at: UserTable.updatedAt,
      })
      .from(UserTable)
      .where(eq(UserTable.id, userId))
      .limit(1);  
      req.user = user[0];
      


  res.cookie("jwt" , token , {
        maxAge : 7 * 24 * 60 * 60 *1000,
        httpOnly : true,
        sameSite : "strict" , 
       

    })

    next(); 
  } catch (err) {
     res.status(403).json({ message: 'Invalid or expired token' });
     return
  }
};

export default validateToken;
