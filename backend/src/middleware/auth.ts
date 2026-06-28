import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';


const JWT_SECRET = process.env.JWT_SECRET!;

export const requireAuth = (req:Request , res:Response, next:NextFunction)=>{
    const token = req.cookies.token

    if(!token){
        res.status(401).json({message: "you need to login"})
        return
    }

    try{
        const decoded = jwt.verify(token, JWT_SECRET) as {userId: number}
        (req as any).userId = decoded.userId
        next()
    }
    catch{
        res.status(401).json({message: " unvalid token"})
    }


}