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
    type : "line",
    startX: number,
    startY: number, 
    endX: number,
    endY: number
} | {
    type: "pencil",
    points: { x: number, y: number }[]
};

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
    private currentPencilPoints: { x: number, y: number }[] = []

    constructor(canvas: HTMLCanvasElement, roomId: number, socket:WebSocket) {
        this.canvas = canvas
        this.ctx = canvas.getContext("2d")! // ! is here non-null assertion operator
        this.existingShapes = []
        this.roomId = roomId
        this.clicked = false
        this.socket = socket

        if (!this.ctx) console.log("⚠️ Canvas context not found!")

        this.init()
        this.initHandlers()
        this.initMouseHandlers()
        this.renderExistingShapes()
    }

    setTool(tool: Tool) {
        this.selectedTool = tool
    }

    async init() {
        this.existingShapes = await getExistingShapes(this.roomId) || []
        this.renderExistingShapes()
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
                        this.renderExistingShapes()
                    } else {
                        console.log("Invalid shape recieved")
                    }
                } catch (error) {
                    console.error("Failed to parse incoming shape:", error)
                }
            }
        }
    }

    
    // Replace your existing drawPencil function with this:

    drawPencil(e: MouseEvent) {
        if (!this.clicked) return;

        // Get canvas-relative coordinates
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        this.currentPencilPoints.push({ x: mouseX, y: mouseY });

        this.ctx.fillStyle = "#ffffff";

        // Get last position
        let x1 = mouseX;
        let x2 = this.startX;
        let y1 = mouseY;
        let y2 = this.startY;

        // Calculate line thickness based on drawing speed
        const distance = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
        let lineThickness = 1

        // Handle case where mouse hasn't moved
        if (distance < 0.5) {
            this.ctx.fillRect(x1, y1, lineThickness, lineThickness);
            return;
        }

        // Bresenham's line algorithm with variable thickness
        const steep = Math.abs(y2 - y1) > Math.abs(x2 - x1);
        if (steep) {
            [x1, y1] = [y1, x1];
            [x2, y2] = [y2, x2];
        }
        if (x1 > x2) {
            [x1, x2] = [x2, x1];
            [y1, y2] = [y2, y1];
        }

        const dx = x2 - x1;
        const dy = Math.abs(y2 - y1);
        
        // Handle vertical/near-vertical lines
        if (dx === 0) {
            const startY = Math.min(y1, y2);
            const endY = Math.max(y1, y2);
            for (let y = startY; y <= endY; y++) {
                if (steep) {
                    this.ctx.fillRect(y, x1, lineThickness, lineThickness);
                } else {
                    this.ctx.fillRect(x1, y, lineThickness, lineThickness);
                }
            }
        } else {
            let error = 0;
            const de = dy / dx;
            const yStep = y1 < y2 ? 1 : -1;
            let y = y1;

            // Draw the line using Bresenham algorithm
            for (let x = x1; x <= x2; x++) {
                if (steep) {
                    this.ctx.fillRect(y, x, lineThickness, lineThickness);
                } else {
                    this.ctx.fillRect(x, y, lineThickness, lineThickness);
                }

                error += de;
                if (error >= 0.5) {
                    y += yStep;
                    error -= 1.0;
                }
            }
        }

        // Update last coordinates for continuous drawing
        this.startX = mouseX;
        this.startY = mouseY;
    }

    // ------------------- Function to render the already drawn shapes ------------------------------------------------
    renderExistingShapes() {
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
            
            } else if (shape.type === "line") {
                this.ctx.beginPath()
                this.ctx.moveTo(shape.startX, shape.startY)
                this.ctx.lineTo(shape.endX, shape.endY)
                this.ctx.stroke()
                
            } else if (shape.type === "pencil") {
                const points = shape.points
                if (!points || points.length < 2) return; 
                
                // Ensure the first point is defined (TypeScript may still consider points[0] possibly undefined)
                const firstPoint = points[0];
                if (!firstPoint) return;

                this.ctx.beginPath();
                this.ctx.moveTo(firstPoint.x, firstPoint.y);

                for (let i = 1; i < points.length; i++) {
                    const p = points[i];
                    if (!p) continue;
                    this.ctx.lineTo(p.x, p.y);
                }
                this.ctx.stroke();
                this.ctx.closePath();
            }

        })
    }

    mouseDownHandler (e : MouseEvent) {
        this.clicked = true
        this.startX = e.clientX
        this.startY = e.clientY

        // Reset pencil points array when starting a new drawing
        if (this.selectedTool === "pencil") {
            this.currentPencilPoints = [{ x: this.startX, y: this.startY }]
            this.renderExistingShapes()
        }
        console.log(`X:${this.startX}, Y:${this.startY}`)
    }

    mouseUpHandler (e: MouseEvent) {
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
        } else if (selectedTool === "line") {
            shape = {
                type: "line",
                startX: this.startX,
                startY: this.startY,
                endX: this.startX + width,
                endY: this.startY + height
            }
        } else if (selectedTool === "pencil") {
            if (this.currentPencilPoints.length > 0) {
                shape = {
                    type: "pencil",
                    points: this.currentPencilPoints
                }
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
            console.log("Socket not open, message not sent")
        }
    }

    mouseMoveHandler(e: MouseEvent) {
        const width = e.clientX - this.startX
        const height = e.clientY - this.startY

        if(this.clicked) {
            this.ctx.strokeStyle = "rgba(255, 255, 255)"
            const selectedTool: Tool = this.selectedTool
            if (selectedTool !== "pencil") {
                this.renderExistingShapes() // renders the shapes which already a user drew
            }

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
            
            } else if (selectedTool === "line") {
                const endX = this.startX + width
                const endY = this.startY + height
                this.ctx.beginPath()
                this.ctx.moveTo(this.startX, this.startY)
                this.ctx.lineTo(endX, endY)
                this.ctx.stroke()
            
            } else if (selectedTool === "pencil") {
                this.drawPencil(e)
            }
        }
    }

    initMouseHandlers() {
        // Click the mouse
        this.canvas.addEventListener("mousedown", this.mouseDownHandler.bind(this))

        // Drop the mouse
        this.canvas.addEventListener("mouseup", this.mouseUpHandler.bind(this))

        // Click and drag the mouse
        this.canvas.addEventListener("mousemove", this.mouseMoveHandler.bind(this))
    }
}