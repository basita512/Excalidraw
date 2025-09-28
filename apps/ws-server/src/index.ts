import { WebSocketServer } from "ws";
import { JWT_SECRET } from '@repo/backend-comman/config'
import jwt, { JwtPayload } from 'jsonwebtoken'


const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", function connection(ws, Request) {
    const url = Request.url
    // ws://localhost:9000?token=123456
    // ['ws:localhost:900', 'token=123456'

    if(!url) {
        return
    }
    const queryParam = new URLSearchParams(url.split('?')[1])
    const token = queryParam.get('token') || ""
    const decoded = jwt.verify(token, JWT_SECRET)

    if (typeof decoded == 'string') {
        ws.close()
        return
    }

    if (!decoded || (!decoded.userId)){ // here after hovering the data type of decoded is only 'JwtPayload' not string
        ws.close()
        return
    }

    ws.on('message', function message(data) {
        ws.send("Hello from Websocket server")
    })
    
})