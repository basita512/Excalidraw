"use client"

import { useEffect, useRef, useState } from "react"
import TopBar from "./TopBar"
import { Board } from "draw/board"

export type Tool = "circle" | "rect" | "line" | "pencil"

export default function Canvas({ roomId, socket }: { roomId: number, socket: WebSocket | null }) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const initialized = useRef(false)
    const [selectedTool, setSelectedTool] = useState<Tool>("circle")
    const [board, setBoard] = useState<Board>()

    useEffect(() => {
        board?.setTool(selectedTool)
    }, [selectedTool, board])

    useEffect(() => {
        if (!canvasRef.current || !socket || initialized.current) return
        initialized.current = true
        const canvas = canvasRef.current

        canvas.width = canvas.clientWidth
        canvas.height = canvas.clientHeight

        const draw = new Board(canvas, roomId, socket)
        setBoard(draw)
            draw.setTool(selectedTool)

        return () => {
            draw.destroy()
        }
    }, [roomId, socket])

    return(
        <div className="relative w-full min-h-screen">
            <canvas ref={canvasRef}  className="w-full min-h-screen"></canvas>
            <div className="absolute bottom-4 left-1/2 bg-[#ffffff2b] p-2 rounded-full">
                <TopBar selectedTool={selectedTool} setSelectedTool={setSelectedTool} />
            </div>
        </div>
    )
}