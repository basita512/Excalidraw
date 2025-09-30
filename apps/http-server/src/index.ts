import express from 'express';
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '@repo/backend-comman/config';
import { middleware } from './middleware';
import { createUserSchema, signinUserSchema, createRoomSchema } from '@repo/comman/types';
import { prismaClient } from '@repo/db/client';
import bcrypt from 'bcrypt'

const saltRounds = 10
const app = express();
app.use(express.json())


//----------------------------- When user Sign-up -----------------------------------------

app.post('/signup', async (req, res) => {
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
})


//------------------------------ When user sign-in-----------------------------------

app.post('/signin', async (req, res) => {
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
})


//------------------------------ When user wants to create room-----------------------------------

app.post('/room', middleware, async (req, res) => {
    try {
        const parsedData = createRoomSchema.safeParse(req.body)

        if (!parsedData.success){
            return res.status(411).json({
                message: "Incorrect inputs"
            })
        }

        // @ts-ignore
        const userId = req.userId
        const room = await prismaClient.room.create({
            data : {
                slug : parsedData.data.roomName,
                adminId : userId,
                createdAt : new Date()
            }
        })

        if(room) {
            return res.status(200).json({
                message : "Room created successfully",
                roomId : room.id,
                createdAt : room.createdAt
            })
        }
    } catch (error) {
        console.log(error)
        res.status(411).json({
            message: "Room Already exists with this name"
        })
    }

})


// ---------------------------- Retrive old chats -----------------------------------------

app.get('/chats/:roomId', async (req, res) => {
    const roomId = Number(req.params.roomId)
    const messages = await prismaClient.chat.findMany({
        where: {
            roomId
        },
        orderBy : {
            id: "desc"
        },
        take : 50
    })

    res.status(200).json({
        messages
    })
})

app.listen(4000, () => console.log('HTTP server running on port 4000'));