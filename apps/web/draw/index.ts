import axios from "axios"
import { HTTP_BACKEND_URL } from "config"

type Shape = {
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
}

export default async function initDraw(canvas: HTMLCanvasElement, roomId:number, socket:WebSocket | null) {
    const ctx = canvas.getContext("2d")
    let existingShapes: Shape[] = (await getExistingShapes(roomId)) || []

    if(!ctx){
        return
    }

    // rendering the live room shapes 
    if (socket != null) {
        socket.onmessage = (event) => {
            const response = JSON.parse(event.data)

            if (response.type === "chat") {
                try {
                    const parsedShape = JSON.parse(response.message)
                    const shape = parsedShape.shape ?? parsedShape //fallback
                    console.log("Recieved Shape Data:",shape)

                    if(shape && shape.type) {
                        existingShapes.push(shape)
                        console.log("New shape added: ", existingShapes)
                        clearCanvas(existingShapes, ctx, canvas)
                    } else {
                        console.log("Invalid shape recieved")
                    }
                } catch (error) {
                    console.error("Failed to parse incoming shape:", error)
                }
            }
        }
    }
    
    
    clearCanvas(existingShapes, ctx, canvas) // renders the shapes which are in server
    let clicked = false
    let startX = 0
    let startY = 0

    // Click the mouse
    canvas.addEventListener("mousedown", (e) => {
        clicked = true
        startX = e.clientX
        startY = e.clientY
        console.log(`X:${startX}, Y:${startY}`)
    })

    // Drop the mouse
    canvas.addEventListener("mouseup", (e) => {
        clicked = false
        const width = e.clientX - startX
        const height = e.clientY - startY
        const shape : Shape = {
            type: "rect",
            x: startX,
            y: startY,
            width,
            height
        }

        // sending client drawn shape to the room when mouse up
        if (socket && socket.readyState === WebSocket.OPEN){
            socket.send(JSON.stringify({
                type : "chat",
                message: JSON.stringify(shape),
                roomId
            }))
            console.log("Sent your drawn shape to backend:", shape)
        } else {
            console.log("⚠️ Socket not open, message not sent")
        }
    })

    // Click and drag the mouse
    canvas.addEventListener("mousemove", (e) => {
        if(clicked) {
            const width = e.clientX - startX
            const height = e.clientY - startY
       
            clearCanvas(existingShapes, ctx, canvas) // renders the shapes which already a user drew
            ctx.strokeStyle = "rgba(255, 255, 255)"
            ctx.strokeRect(startX, startY, width, height)
        }
    })
}



// ------------------- Function to render the already drawn shapes ------------------------------------------------

function clearCanvas(existingShapes: Shape[], ctx:CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = "rgba(0, 0, 0)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Rendering all existing shapes
    existingShapes.map((shape) => {
        if (shape.type === "rect") {
            ctx.strokeStyle = "rgba(255, 255, 255)"
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height)
        }
    })
}


// ----------------- Function to retreive all existing shapes from backend -----------------------------------------------

async function getExistingShapes(roomId:number) {
    const response = await axios.get(`${HTTP_BACKEND_URL}/canvas/${roomId}`)
    const messages = response.data?.messages || []
    console.log("Fetched shapes:", messages)

    const shapes = messages.map((shape : {message:string}) => {
        try {
            const shapesData = JSON.parse(shape.message)
            return shapesData.shape ?? shapesData
        } catch (error) {
            console.warn("⚠️ Invalid shape message skipped:", error)
            return null
        }
    })

    return shapes
}