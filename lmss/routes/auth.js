import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { handelSignUps, handelSingIn, updateUser, allUsers, getUserById, deleteUser, getMe } from '../controller/Auth.js';

const user = express.Router()

// Public: sign-up and sign-in
user.post('/sign-up', handelSignUps)
user.post('/sign-in', handelSingIn)

// Protected: user data operations
user.get('/me', authenticate, getMe)
user.put('/update/:userId', authenticate, updateUser)
user.get('/users', authenticate, allUsers)
user.get('/user/:userId', authenticate, getUserById)
user.delete('/delete/:userId', authenticate, deleteUser)

export default user