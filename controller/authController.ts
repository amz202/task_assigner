import { Request, Response } from 'express';
import bcrypt from 'bcrypt';


type UserRole = "employee" | "manager" | "admin";

interface AuthBody {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}


export const signup = (req: Request<{}, {}, AuthBody>, res: Response) => {
    
  const { name, email, password ,role } = req.body;

  const validRoles = ["employee", "manager", "admin"] as const;
  if (!validRoles.includes(role)) {
     res.status(400).json({ message: "Invalid role" });
     return;
  }

  if (!name || !email || !password || !role) {
     res.status(400).json({ message: 'All fields are required' });
     return;
  }

  // todo : check if email already exist in db

  const hashedPassword = bcrypt.hashSync(password, 10);

  // todo : save user to db with hashed password





   res.status(200).json({ message: 'Signup successful' });
   return;
};


export const login = async (req: Request<{}, {}, { email: string; password: string }>, res: Response) => {

    const { email, password } = req.body;
   
};


export const logout =(req: Request, res: Response) => {
  // Clear the JWT cookie
  res.clearCookie('jwt', {
    httpOnly: true,
    sameSite: 'strict',
  });

  res.status(200).json({ message: 'Logout successful' });
}

export const checkAuth = (req: Request, res: Response) => {
    // Check if the user is authenticated by checking the JWT cookie
    const token = req.cookies.jwt;
  
    if (!token) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
  
    // todo : verify token and get user info
  
    res.status(200).json({ message: 'User is authenticated' });
  }