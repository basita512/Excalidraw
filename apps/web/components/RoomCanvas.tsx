"use client"
import { WEBSOCKET_URL } from "config"
import { useEffect, useRef, useState } from "react"
import Canvas from "./Canvas"


export default function RoomCanvas({roomId} : { roomId:number }) {
    const [socket, setSocket] = useState<WebSocket | null>(null)
    const [token, setToken] = useState<string | null>('')

    useEffect(() => {
        const userToken = localStorage.getItem("token")
        setToken(userToken)
    }, [])

    useEffect(() => {
        if (!token) return
        const ws = new WebSocket(`${WEBSOCKET_URL}?token=${token}`)
        console.log(`Token: ${token}`)

        ws.onopen = () => {
            setSocket(ws)
            console.log("Connected to WS");
            const data = JSON.stringify({
                type : "join_room",
                roomId
            })
            console.log(data)
            ws.send(data)
        }
    }, [token])

    if (!socket) {
        return <div>Connecting to the Server..........</div>
    }

    return (
        <div className="">
            <Canvas roomId={roomId} socket={socket} />
        </div>
    )
}