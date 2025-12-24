import { Request, Response } from "express";
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '@repo/backend-comman/config';
import { createUserSchema, signinUserSchema, createRoomSchema } from '@repo/comman/types';
import { prismaClient } from '@repo/db/client';
import bcrypt from 'bcrypt'
import { OAuth2Client } from "google-auth-library";
import { middleware } from "../middleware";

const saltRounds = 10
const client = new OAuth2Client(process.env.GOOGLE_OAUTH_CLIENT_ID)

//----------------------------- When user Sign-up -----------------------------------------

export async function SignUpController (req: Request, res: Response)  {
    try {
        const parsedData = createUserSchema.safeParse(req.body)
        console.log("Sign-in data recived from frontend", parsedData)

        // Wrong inout checks
        if(!parsedData.success) {
            console.log("User entered Incorret Inputs")
            return res.status(409).json({
                message: "Incorrect Inputs",
                errors : parsedData.error,
            })
        }

        // Exisiting User check
        const existingUser = await prismaClient.user.findUnique({
            where : {
                username : req.body.username
            }
        })

        // If user exists
        if (existingUser) {
            return res.status(411).json({
                mesaage : "User belonging to this username already exists"
            })
        }

        // If new User
        const hashedPassword = await bcrypt.hash(parsedData.data.password, saltRounds)
        const user = await prismaClient.user.create({
            data : {
                username : parsedData.data.username,
                password : hashedPassword,
                name : parsedData.data.name
            }
        })
        const userId = user.id

        // Generating auth token
        const token = jwt.sign({userId}, JWT_SECRET)
        res.json({
            message : "User created successfully",
            userId : userId,
            token : token
        })
        console.log(`User created successfully with token: ${token}`)

    } catch (error) {
        console.error('Sign up error:', error)
        res.status(500).json({
            message : "Internal server error"
        })
    }
}


//------------------------------ When user sign-in-----------------------------------

export async function SignInController(req:Request, res:Response) {
    try {
        const parsedData = signinUserSchema.safeParse(req.body)

        // Invalid format
        if(!parsedData.success){
            console.log(parsedData)

            return res.status(411).json({
                message : "Inavlid Id and Password"
            })
        }

        // Finding user by username
        const dbUser = await prismaClient.user.findUnique({
            where : {
                username : parsedData.data.username
            }
        })

        // If username not found
        if (!dbUser) {
            return res.status(404).json({
                message : "Username does not exists"
            })
        }

        // Check the password matches or not
        const ismatch = await bcrypt.compare(parsedData.data.password, dbUser.password)
        if (!ismatch) {
            return res.status(401).json({
                message : "Incorrect password"
            })
        }

        // If username and password are correct sign the token
        const userId = dbUser.id
        if (dbUser) {
            const token = jwt.sign({ userId }, JWT_SECRET)
            return res.status(200).json({
                message : "User signed-in succesfully",
                userId : userId,
                token : token
            })
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message : "Internal server error"
        })
    }

}


//------------------------------ When user sign-in with Google Account-----------------------------------

export async function GoogleLoginController(req: Request, res: Response) {
    try {
        const { idToken } = req.body

        if (!idToken) {
            return res.status(400).json({
                message: "Missing idToken"
            })
        }

        // 1. Verify Google id token
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_OAUTH_CLIENT_ID
        })

        const payload = ticket.getPayload()
        if (!payload) {
            return res.status(401).json({
                message: "Invalid Google token"
            })
        }

        const email = payload.email;
        const googleId = payload.sub;

        if (!email || !googleId) {
            return res.status(400).json({
                message: "Google token missing email or sub"
            })
        }

        // Check if user exists with this googleId
        let user = await prismaClient.user.findUnique({
            where: { googleId }
        })

        if (!user) {
            // Check if user exists with this email
            user = await prismaClient.user.findUnique({
                where: { email }
            })

            if (user) {
                // Link account
                user = await prismaClient.user.update({
                    where: { id: user.id },
                    data: { googleId }
                })
            } else {
                // Create new user
                // Generate a random password and username if creating from Google
                const randomPassword = Math.random().toString(36).slice(-8);
                const hashedPassword = await bcrypt.hash(randomPassword, saltRounds);

                // Ensure unique username
                const baseUsername = email.split('@')[0];
                let username = baseUsername;
                let counter = 1;
                while (await prismaClient.user.findUnique({ where: { username } })) {
                    username = `${baseUsername}${counter}`;
                    counter++;
                }

                user = await prismaClient.user.create({
                    data: {
                        email,
                        googleId,
                        name: (payload.name || baseUsername) as string,
                        username: (username || baseUsername) as string,
                        password: hashedPassword
                    }
                })
            }
        }

        const jwtToken = jwt.sign({ userId: user.id }, JWT_SECRET);

        res.json({
            message: "Logged in successfully",
            token: jwtToken,
            userId: user.id
        })


    } catch (error) {
        console.log("Login failed: ", error)
        res.status(500).json({ message: "Internal server error" })
    }

}




