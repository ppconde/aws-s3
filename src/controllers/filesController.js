import * as s3Service from '../services/s3Service.js';

/**
 * Generate pre-signed URL for file upload
 * POST /api/files/upload-url
 */
export const getUploadUrl = async (req, res, next) => {
    try {
        const { fileName, contentType } = req.body;
        const userId = req.user.id;

        // Create user-specific S3 key
        const timestamp = Date.now();
        const fileId = `${timestamp}_${fileName}`;
        const s3Key = `users/${userId}/${fileId}`;

        // Get expiration time from environment or use default (5 minutes)
        const expiresIn = parseInt(process.env.PRESIGNED_URL_UPLOAD_EXPIRES || '300', 10);

        // Generate pre-signed upload URL
        const uploadUrl = await s3Service.generatePresignedUploadUrl(
            s3Key,
            contentType,
            expiresIn
        );

        res.status(200).json({
            success: true,
            message: 'Upload URL generated successfully',
            data: {
                uploadUrl,
                fileId,
                key: s3Key,
                contentType,
                expiresIn,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Generate pre-signed URL for file download
 * GET /api/files/:fileId/download-url
 */
export const getDownloadUrl = async (req, res, next) => {
    try {
        const { fileId } = req.params;
        const userId = req.user.id;

        // Construct S3 key
        const s3Key = `users/${userId}/${fileId}`;

        // Verify file exists before generating download URL
        try {
            await s3Service.getFileMetadata(s3Key);
        } catch (error) {
            if (error.name === 'NotFound') {
                return res.status(404).json({
                    success: false,
                    message: 'File not found',
                });
            }
            throw error;
        }

        // Get expiration time from environment or use default (1 hour)
        const expiresIn = parseInt(process.env.PRESIGNED_URL_DOWNLOAD_EXPIRES || '3600', 10);

        // Generate pre-signed download URL
        const downloadUrl = await s3Service.generatePresignedDownloadUrl(s3Key, expiresIn);

        res.status(200).json({
            success: true,
            message: 'Download URL generated successfully',
            data: {
                downloadUrl,
                fileId,
                expiresIn,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * List all files for the authenticated user
 * GET /api/files
 */
export const listFiles = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const prefix = `users/${userId}/`;

        // List files from S3
        const files = await s3Service.listFiles(prefix);

        // Transform file data for response
        const formattedFiles = files.map(file => {
            // Extract fileId from key (remove prefix)
            const fileId = file.key.replace(prefix, '');

            return {
                fileId,
                name: fileId.split('_').slice(1).join('_'), // Remove timestamp prefix
                size: file.size,
                lastModified: file.lastModified,
            };
        });

        res.status(200).json({
            success: true,
            message: 'Files retrieved successfully',
            data: {
                files: formattedFiles,
                count: formattedFiles.length,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a file
 * DELETE /api/files/:fileId
 */
export const deleteFile = async (req, res, next) => {
    try {
        const { fileId } = req.params;
        const userId = req.user.id;

        // Construct S3 key
        const s3Key = `users/${userId}/${fileId}`;

        // Verify file exists before deletion
        try {
            await s3Service.getFileMetadata(s3Key);
        } catch (error) {
            if (error.name === 'NotFound') {
                return res.status(404).json({
                    success: false,
                    message: 'File not found',
                });
            }
            throw error;
        }

        // Delete file from S3
        await s3Service.deleteFile(s3Key);

        res.status(200).json({
            success: true,
            message: 'File deleted successfully',
            data: {
                fileId,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get file metadata
 * GET /api/files/:fileId/metadata
 */
export const getFileMetadata = async (req, res, next) => {
    try {
        const { fileId } = req.params;
        const userId = req.user.id;

        // Construct S3 key
        const s3Key = `users/${userId}/${fileId}`;

        // Get file metadata from S3
        const metadata = await s3Service.getFileMetadata(s3Key);

        res.status(200).json({
            success: true,
            message: 'File metadata retrieved successfully',
            data: {
                fileId,
                name: fileId.split('_').slice(1).join('_'), // Remove timestamp prefix
                contentType: metadata.contentType,
                size: metadata.contentLength,
                lastModified: metadata.lastModified,
                etag: metadata.etag,
            },
        });
    } catch (error) {
        if (error.name === 'NotFound') {
            return res.status(404).json({
                success: false,
                message: 'File not found',
            });
        }
        next(error);
    }
};

export default {
    getUploadUrl,
    getDownloadUrl,
    listFiles,
    deleteFile,
    getFileMetadata,
};
