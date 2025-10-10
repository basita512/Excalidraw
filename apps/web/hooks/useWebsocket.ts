import { useEffect, useState } from "react"
import { WEBSOCKET_URL } from "../app/config"

export function useWebsocket() {
    const [loading, setLoading] = useState(true)
    const [socket, setsocket] = useState<WebSocket>()

    useEffect(() => {
        const ws = new WebSocket(WEBSOCKET_URL)
        
        ws.onopen = () => {
            setLoading(false)
            setsocket(ws)
        }
    }, [])

    return {
        socket,
        loading
    }
}