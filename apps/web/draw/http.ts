import axios from "axios"
import { HTTP_BACKEND_URL } from "config"

// ----------------- Function to retreive all existing shapes from backend -----------------------------------------------

export default async function getExistingShapes(roomId:number) {
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