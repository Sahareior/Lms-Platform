import express from "express";
import { authenticate, requireSelfOrAdmin } from '../middleware/auth.js';
import { upsertNote, getNote, getAllNotesByUser } from "../controller/NoteController.js";

const note = express.Router();

// All note operations require authentication (notes are scoped to the owner)
note.put('/lesson/:lessonId', authenticate, upsertNote);
note.get('/lesson/:lessonId', authenticate, getNote);
note.get('/user/:userId', authenticate, requireSelfOrAdmin('userId'), getAllNotesByUser);

export default note;
