export const validateRegistration = (req, res, next) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
        return res.status(400).json({
            success: false,
            message: 'Email, password, and name are required',
        });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid email format',
        });
    }

    // Password strength validation
    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: 'Password must be at least 6 characters long',
        });
    }

    next();
};

export const validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email and password are required',
        });
    }

    next();
};

import { getMimeType, validateContentType } from './mimeTypes.js';

export const validateFileUpload = (req, res, next) => {
    let { fileName, contentType, fileSize } = req.body;

    if (!fileName) {
        return res.status(400).json({
            success: false,
            message: 'fileName is required',
        });
    }

    // Sanitize file name to prevent path traversal
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    if (sanitizedFileName !== fileName) {
        req.body.fileName = sanitizedFileName;
        fileName = sanitizedFileName;
    }

    // Auto-detect content type from file extension if not provided
    if (!contentType) {
        contentType = getMimeType(fileName);
        if (!contentType) {
            return res.status(400).json({
                success: false,
                message: 'Unable to determine content type from file extension. Please provide contentType.',
            });
        }
        req.body.contentType = contentType;
    } else {
        // Validate that provided content type matches file extension
        if (!validateContentType(fileName, contentType)) {
            const expectedType = getMimeType(fileName);
            return res.status(400).json({
                success: false,
                message: `Content type '${contentType}' does not match file extension. Expected '${expectedType || 'unknown'}'.`,
            });
        }
    }

    // Check file type against allowed types
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || '').split(',');
    if (allowedTypes.length > 0 && !allowedTypes.includes(contentType)) {
        return res.status(400).json({
            success: false,
            message: `File type ${contentType} is not allowed`,
        });
    }

    // Check file size
    const maxSize = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10); // 10MB default
    if (fileSize && fileSize > maxSize) {
        return res.status(400).json({
            success: false,
            message: `File size exceeds maximum allowed size of ${maxSize} bytes`,
        });
    }

    next();
};

export const validateFileId = (req, res, next) => {
    const { fileId } = req.params;

    if (!fileId) {
        return res.status(400).json({
            success: false,
            message: 'File ID is required',
        });
    }

    // Sanitize fileId to prevent path traversal
    if (fileId.includes('..') || fileId.includes('/') || fileId.includes('\\')) {
        return res.status(400).json({
            success: false,
            message: 'Invalid file ID',
        });
    }

    next();
};
