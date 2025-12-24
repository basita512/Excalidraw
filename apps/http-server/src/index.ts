import express from 'express';
import { middleware } from './middleware';
import cors from 'cors'
import { SignInController, SignUpController } from './controllers/AuthControllers';
import { CreateRoomController, FindRoomExists, getPreviousStrokes } from './controllers/CanvasControllers';


const app = express();
app.use(express.json())
app.use(cors());


app.post('/signup', SignUpController)
app.post('/signin', SignInController)

app.post('/room', middleware, CreateRoomController)
app.get('/canvas/:roomId', getPreviousStrokes)
app.get('/room/:slug', FindRoomExists)

app.listen(3001, () => console.log('HTTP server running on port 3001'));