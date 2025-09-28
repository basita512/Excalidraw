import express from 'express';
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '@repo/backend-comman/config';
import { middleware } from './middleware';
import { createUserSchema, signinUserSchema, createRoomSchema } from '@repo/comman/types';

const app = express();
app.use(express.json())

app.post('/signup', (req, res) => {
    // db-call
    const data = createUserSchema.safeParse(req.body)
    
    res.json({
        userId : 426
    })
})

app.get('signin', middleware, (Req, res) => {
    const userId = 1
    jwt.sign({
        userId
    }, JWT_SECRET)
})

app.post('/room', middleware, (req, res) => {
    //db call 

    res.json({
        roomID : 123
    })

})

app.listen(4000, () => console.log('HTTP server running on port 3000'));