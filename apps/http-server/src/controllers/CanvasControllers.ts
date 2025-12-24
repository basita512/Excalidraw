import { prismaClient } from '@repo/db/client'
import { Request, Response } from "express";
import { createRoomSchema } from '@repo/comman/types';


//------------------------------ When user wants to create room-----------------------------------

export async function CreateRoomController (req:Request, res:Response) {
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
}


// ---------------------------- Retrive old chats -----------------------------------------

export async function getPreviousStrokes (req:Request, res:Response) {
    const roomId = Number(req.params.roomId)
    const messages = await prismaClient.chat.findMany({
        where: {
            roomId
        },
        orderBy : {
            id: "desc"
        },
        take : 500
    })

    res.status(200).json({
        messages
    })
}


// ----------------------------To Find the room where user wants to join ---------------------------

export async function FindRoomExists(req:Request, res:Response) {
    const slug = req.params.slug
    const roomId = await prismaClient.room.findFirst({
        where : {
            slug
        }
    })

    res.status(200).json({
        roomId
    })
}