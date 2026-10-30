import express from "express"
import { authenticate, requireRole } from '../middleware/auth.js';
import { cacheMiddleware } from '../middleware/cache.js';
import { createModule, getModulesByCourseId, updateModule, deleteModule } from "../controller/ModuleController.js"

const module = express.Router()

// Public: view a course's modules (with their lessons nested)
module.get('/:courseId', cacheMiddleware({ ttl: 300, keyPrefix: 'cache:module' }), getModulesByCourseId)

// Admin only: create, update, delete
module.post('/create', authenticate, requireRole('admin'), createModule)
module.put('/update/:moduleId', authenticate, requireRole('admin'), updateModule)
module.delete('/delete/:moduleId', authenticate, requireRole('admin'), deleteModule)

export default module
