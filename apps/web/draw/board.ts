import { Tool } from "components/Canvas"
import getExistingShapes from "./http"

export type Shape = {
    type : "rect",
    x: number,
    y: number, 
    width: number,
    height: number
} | {
    type: "circle",
    centerX: number,
    centerY: number,
    radius: number
} | {
    type : "pencil",
    startX: number,
    startY: number, 
    endX: number,
    endY: number
}

export class Board {
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private existingShapes: Shape[]
    private roomId:number
    private clicked:boolean
    private startX:number = 0
    private startY:number = 0
    private socket:WebSocket
    private selectedTool:Tool = "circle"

    constructor(canvas: HTMLCanvasElement, roomId: number, socket:WebSocket) {
        this.canvas = canvas
        this.ctx = canvas.getContext("2d")! // ! is here non-null assertion operator
        this.existingShapes = []
        this.roomId = roomId
        this.clicked = false
        this.socket = socket

        this.init()
        this.initHandlers()
        this.initMouseHandlers()
        this.clearCanvas()
    }

    setTool(tool: Tool) {
        this.selectedTool = tool
    }

    async init() {
        this.existingShapes = await getExistingShapes(this.roomId) || []
        this.clearCanvas()
    }

    destroy() {
        // Click the mouse
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler)

        // Drop the mouse
        this.canvas.removeEventListener("mouseup", this.mouseUpHandler)

        // Click and drag the mouse
        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler)
    }

    initHandlers() {
        this.socket.onmessage = (event) => {
            const response = JSON.parse(event.data)

            if (response.type === "chat") {
                try {
                    const parsedShape = JSON.parse(response.message)
                    const shape = parsedShape.shape ?? parsedShape //fallback
                    console.log("Recieved Shape Data:",shape)

                    if(shape && shape.type) {
                        this.existingShapes.push(shape)
                        console.log("New shape added: ", this.existingShapes)
                        this.clearCanvas()
                    } else {
                        console.log("Invalid shape recieved")
                    }
                } catch (error) {
                    console.error("Failed to parse incoming shape:", error)
                }
            }
        }
    }

    // ------------------- Function to render the already drawn shapes ------------------------------------------------
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.fillStyle = "rgba(0, 0, 0)"
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

        // Rendering all existing shapes
        this.existingShapes.map((shape) => {
            if (shape.type === "rect") {
                this.ctx.strokeStyle = "rgba(255, 255, 255)"
                this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height)

            } else if (shape.type === "circle") {
                this.ctx.beginPath()
                this.ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI*2)
                this.ctx.stroke()
                this.ctx.closePath()
            }
        })
    }

    mouseDownHandler(e : any) {
        this.clicked = true
        this.startX = e.clientX
        this.startY = e.clientY
        console.log(`X:${this.startX}, Y:${this.startY}`)
    }

    mouseUpHandler(e: any) {
        this.clicked = false
        const width = e.clientX - this.startX
        const height = e.clientY - this.startY
        
        const selectedTool : Tool = this.selectedTool
        let shape : Shape | null  = null 

        if (selectedTool === 'rect') {
            shape = {
                type: "rect",
                x: this.startX,
                y: this.startY,
                width,
                height
            }
        } else if (selectedTool === "circle") {
            const radius = Math.max(width, height) / 2
            shape = {
                type: "circle",
                radius: radius,
                centerX: this.startX + radius,
                centerY: this.startY + radius
            }
        }

        if (!shape) {
            return
        }

        // sending client drawn shape to the room when mouse up
        if (this.socket && this.socket.readyState === WebSocket.OPEN){
            this.socket.send(JSON.stringify({
                type : "chat",
                message: JSON.stringify(shape),
                roomId : this.roomId
            }))
            console.log("Sent your drawn shape to backend:", shape)
        } else {
            console.log("⚠️ Socket not open, message not sent")
        }
    }

    mouseMoveHandler(e: any) {
        const width = e.clientX - this.startX
        const height = e.clientY - this.startY

        if(this.clicked) {
            this.clearCanvas() // renders the shapes which already a user drew
            this.ctx.strokeStyle = "rgba(255, 255, 255)"
            // this.ctx.strokeRect(this.startX, this.startY, width, height)

            const selectedTool: Tool = this.selectedTool
            if (selectedTool === "rect") {
                this.ctx.strokeRect(this.startX, this.startY, width, height)

            } else if (selectedTool === "circle") {
                const radius = Math.max(width, height)/2
                const centerX = this.startX + radius
                const centerY = this.startY + radius
                this.ctx.beginPath()
                this.ctx.arc(centerX, centerY, radius, 0, Math.PI*2)
                this.ctx.stroke()
                this.ctx.closePath()
            }
        }
    }

    initMouseHandlers() {
        // Click the mouse
        this.canvas.addEventListener("mousedown", this.mouseDownHandler)

        // Drop the mouse
        this.canvas.addEventListener("mouseup", this.mouseUpHandler)

        // Click and drag the mouse
        this.canvas.addEventListener("mousemove", this.mouseMoveHandler)
    }
}