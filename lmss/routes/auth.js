import express from 'express';
import { handelSignUps, handelSingIn,updateUser,allUsers, getUserById } from '../controller/Auth.js';

const user = express.Router()

user.post('/sign-up',handelSignUps)
user.post('/sign-in',handelSingIn)
user.put('/update/:userId', updateUser)
user.get('/users', allUsers)
user.get('/user/:userId', getUserById)

export default user