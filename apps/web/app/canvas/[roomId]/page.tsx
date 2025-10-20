"use client"
import initDraw from "draw"
import { useEffect, useRef } from "react"

export default function Canvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current
            
            initDraw(canvas)
        }
    }, [canvasRef])

    return (
        <div className="">
            <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight}  className="w-full h-screen"></canvas>
        </div>
    )
}