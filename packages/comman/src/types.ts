import { z } from 'zod';

export const createUserSchema = z.object({
    username : z.string().min(5).max(20),
    password : z.string().min(8),
    name : z.string()
}) 

export const signinUserSchema = z.object({
    username : z.string(),
    password : z.string()
}) 

export const createRoomSchema = z.object({
    roomName : z.string()
}) 