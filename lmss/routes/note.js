import express from "express";
import { authenticate } from '../middleware/auth.js';
import { upsertNote, getNote, getAllNotesByUser } from "../controller/NoteController.js";

const note = express.Router();

// All note operations require authentication
note.put('/lesson/:lessonId', authenticate, upsertNote);
note.get('/lesson/:lessonId', authenticate, getNote);
note.get('/user/:userId', authenticate, getAllNotesByUser);

export default note;
