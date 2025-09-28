import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken'
import { JWT_SECRET } from "@repo/backend-comman/config";


export function middleware (req: Request, res: Response, next: NextFunction) {
    // 1. Checking the bearer token
    const authHeader = req.headers.authorization || ""
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error : "Invaid Token format"
        })
    }

    // 2. Extracting the token
    const token = authHeader.split(' ')[1]
    if (!token || !JWT_SECRET) {
        return res.status(401).json({ 
            message: 'Unauthorized - no token recieved' 
        });
    }

    try {
        // 3. Verify the token
        const decodedToken = jwt.verify(token, JWT_SECRET)
        req.userId = decodedToken.userId

        // 4. continue
        next()

    } catch (error) {
        return res.status(401).json({
            message: "Token verification failed"
        })
    }
    
    
}