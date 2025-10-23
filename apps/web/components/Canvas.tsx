"use client"

import initDraw from "draw"
import { useEffect, useRef } from "react"


export default function Canvas({roomId, socket} : {roomId:number, socket:WebSocket | null}) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const initialized = useRef(false)

    useEffect(() => {
        if (!canvasRef.current || !socket || initialized.current) return
            initialized.current = true
            const canvas = canvasRef.current

            canvas.width = canvas.clientWidth
            canvas.height = canvas.clientHeight

            initDraw(canvas, roomId, socket)
    }, [roomId, socket])

    return(
        <div className="">
            <canvas ref={canvasRef}  className="w-full min-h-screen"></canvas>
        </div>
    )
}