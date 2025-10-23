import { WebSocketServer } from "ws";
import { JWT_SECRET } from '@repo/backend-comman/config'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { prismaClient } from "@repo/db/client";
import WebSocket from "ws";


const wss = new WebSocketServer({ port: 8080 });

interface User {
    ws : WebSocket,
    rooms : string[]
    userId : string
}

const users: User[] = []

function checkUserAuthentication(token: string): string | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        console.log(decoded) // userId, iat

        if (typeof decoded == "string") {
            return null
        }

        if (!decoded || !decoded.userId) {
            return null
        }
        return decoded.userId
    } catch (error) {
        return null
    }
}

wss.on("connection", async function connection(ws, Request) {
    const url = Request.url
    // ws://localhost:9000?token=123456
    // ['ws:localhost:900', 'token=123456']

    if(!url) {
        return
    }
    const queryParam = new URLSearchParams(url.split('?')[1])
    const token = queryParam.get('token') || ""
    const userId = checkUserAuthentication(token)

    if (userId === null) {
        ws.close()
        return null
    } 

    // Adding users details in the global "users" array
    users.push({
        userId,
        rooms: [],
        ws
    })
    console.log("User Authenthicated: ", userId)
    
    ws.on('message', async function message(data) {
        console.log("Message recieved on message handler: ", data)

        let parsedData
        if (typeof data !== "string") {
            parsedData = JSON.parse(data.toString())
        } else {
            parsedData = JSON.parse(data)
        } 

        if (parsedData.type === "join_room") {
            const user = users.find(i => i.ws === ws) // finding user in Users array
            const roomId = String(parsedData.roomId)
            
            // Checking if user exists AND parsed room is not already in the user's room array, then add it in the room array
            if (user && !user.rooms.includes(roomId)) {    
                user?.rooms.push(roomId)
            }
        }

        if (parsedData.type === "leave_room") {
            const user = users.find(i => i.ws === ws)
            if (!user) {
                return null
            }
            user.rooms = user?.rooms.filter(i => i === parsedData.room)
        }

        console.log("Recieved parsed message: ", parsedData)

        if (parsedData.type === "chat") {
            const roomId = String(parsedData.roomId)
            const message = parsedData.message
        
            users.forEach(user => {
                if (user.rooms.includes(roomId)) {
                    const data = JSON.stringify({
                        type : "chat",
                        message : message,
                        roomId: roomId
                    })
                    console.log(data)
                    user.ws.send(data)
                }
            })

            await prismaClient.chat.create({
                data : {
                    roomId : Number(roomId),
                    userId,
                    message,
                    sentAt : new Date()
                }
            })
        }
        
    })
    

})