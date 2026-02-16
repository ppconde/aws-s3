import express from 'express';
import {
    getUploadUrl,
    getDownloadUrl,
    listFiles,
    deleteFile,
    getFileMetadata,
} from '../controllers/filesController.js';
import authenticate from '../middleware/auth.js';
import { validateFileUpload, validateFileId } from '../utils/validators.js';

const router = express.Router();

// All file routes require authentication
router.use(authenticate);

// POST /api/files/upload-url
router.post('/upload-url', validateFileUpload, getUploadUrl);

// GET /api/files/:fileId/download-url
router.get('/:fileId/download-url', validateFileId, getDownloadUrl);

// GET /api/files
router.get('/', listFiles);

// DELETE /api/files/:fileId
router.delete('/:fileId', validateFileId, deleteFile);

// GET /api/files/:fileId/metadata
router.get('/:fileId/metadata', validateFileId, getFileMetadata);

export default router;
