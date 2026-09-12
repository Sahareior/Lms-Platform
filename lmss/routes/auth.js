import express from 'express';
import { authenticate, requireRole, requireSelfOrAdmin } from '../middleware/auth.js';
import { authRateLimit } from '../middleware/rateLimit.js';
import { handelSignUps, handelSingIn, updateUser, allUsers, getUserById, deleteUser, getMe, exportUsersCsv, forgotPassword, resetPassword } from '../controller/Auth.js';

const user = express.Router()

// Public: sign-up and sign-in (dedicated brute-force limiter)
user.post('/sign-up', authRateLimit, handelSignUps)
user.post('/sign-in', authRateLimit, handelSingIn)

// Public: password reset (also rate-limited to slow down token brute force)
user.post('/forgot-password', authRateLimit, forgotPassword)
user.post('/reset-password', authRateLimit, resetPassword)

// Protected: current-user operations
user.get('/me', authenticate, getMe)
user.put('/update/:userId', authenticate, requireSelfOrAdmin('userId'), updateUser)

// Admin only: manage other users
user.get('/users', authenticate, requireRole('admin'), allUsers)
user.get('/users/export', authenticate, requireRole('admin'), exportUsersCsv)
user.get('/user/:userId', authenticate, requireRole('admin'), getUserById)
user.delete('/delete/:userId', authenticate, requireRole('admin'), deleteUser)

export default user