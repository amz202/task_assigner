import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { db } from '../data/db';
import { UserTable } from '../data/schema';
import { eq  } from 'drizzle-orm';
import { generateToken } from '../utils/generateToken';


// Extend Express Request interface to include 'user' with 'role' and 'id'
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: string;
      }
    }
  }
}

type UserRole = "employee" | "manager" | "admin";

interface AuthBody {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}


export const signup = async (req: Request, res: Response) => {

  try{
  const { name, email, password, role } = req.body;

  console.log("Signup request received:", { name, email, role , password });

  const validRoles = ["employee", "manager", "admin"] as const;

  if (!validRoles.includes(role)) {
    res.status(400).json({ message: "Invalid role" });
    return; 
  }


  if (!name || !email || !password || !role) {
    res.status(400).json({ message: 'All fields are required' });
    return; 
  }

  // Check if email already exists
  const existing = await db.select().from(UserTable).where(eq(UserTable.email, email));
  if (existing.length > 0) {
     res.status(400).json({ message: 'Email already exists' });
     return;
  }

  // Hash the password
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user =await db.insert(UserTable).values({
    name,
    email,
    passwordHash: hashedPassword,
    role,
    isApproved: 0,
  });
  res.status(200).json({ message: 'Signup successful, pending admin approval.'  });
  return;

}
catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const login = async (req: Request, res: Response) => {

  try{
  const { email, password } = req.body;
  // Validate input
  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required' });
    return; 
  }

  // Check if user exists
  const users = await db.select().from(UserTable).where(eq(UserTable.email, email));
  if (users.length === 0) {
    res.status(400).json({ message: 'Invalid credentials' });
    return; 
  }

  // Check if user is approved
  const user = users[0];
  if (!user.isApproved) {
    res.status(403).json({ message: 'Account not approved by admin yet.' });
    return;  
  }
     

  // Compare password
  const valid = bcrypt.compareSync(password, user.passwordHash);
  if (!valid) {
    res.status(400).json({ message: 'Invalid credentials' });
    return; 
  }

  generateToken(user.id, res);
  res.status(200).json({ message: 'Login successful', user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  return; 

}
catch(e){
  console.error("Error during login:", e);
  res.status(500).json({ message: 'Internal server error' });
  return;
}
};



export const approveUser = async (req: Request, res: Response) => {
  
  try{
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }
  const { id } = req.params;
  const updated = await db.update(UserTable).set({ isApproved: 1 }).where(eq(UserTable.id, Number(id))).returning();
  if (updated.length === 0) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  res.status(200).json({ message: 'User approved', user: updated[0] });
}
catch(e){
  console.log("error in approving Users " , e);
  res.status(500).json({message : "Internal Server Error"} )
}
};



export const listPendingUsers = async (req: Request, res: Response) => {

  try{
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }
  const pending = await db.select().from(UserTable).where(eq(UserTable.isApproved, 0));
  res.status(200).json({ users: pending });
}
catch(e){
  console.log("error in list pending users" , e);
  res.status(500).json({message : "internal server error"});
}
};


export const logout =(req: Request, res: Response) => {
  // Clear the JWT cookie
  try{
  res.clearCookie('jwt', {
    httpOnly: true,
    sameSite: 'strict',
  });

  res.status(200).json({ message: 'Logout successful' });
}
catch(e){
  console.log("error in logging out " , e);
  res.status(500).json({message : "Internal server Error"})
}
}

export const checkAuth = (req: Request, res: Response) => {
    // Check if the user is authenticated by checking the JWT cookie
    try{
    const token = req.cookies.jwt;
  
    if (!token) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
  
  
  
    res.status(200).json({ message: 'User is authenticated' });
  }
  catch(e){
    console.log("error in checkAuth controller" , e);
    res.status(500).json({message : "internal server error"})
  }
  }