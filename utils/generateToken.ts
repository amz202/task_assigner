import { Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const generateToken = (userId :number , res:Response)=>{

    const secret = process.env.JWT_SECRET ;
    if (!secret) {
        throw new Error("JWT secret is not defined in environment variables");
    }

    const token = jwt.sign({userId} , secret , {
        expiresIn:"7d"
    } )

    res.cookie("jwt" , token , {
        maxAge : 7 * 24 * 60 * 60 *1000,
        httpOnly : true,
        sameSite : "strict" , 
       

    })
    return token;
}