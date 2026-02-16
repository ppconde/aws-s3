import * as s3Service from '../services/s3Service.js';

/**
 * Generate pre-signed URL for file upload
 * POST /api/files/upload-url
 */
export const getUploadUrl = async (req, res, next) => {
    try {
        const { fileName, contentType, region } = req.body;
        const userId = req.user.id;

        // Validate region
        const validRegions = ['UK', 'IRE'];
        if (!region || !validRegions.includes(region)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid region. Must be UK or IRE',
            });
        }

        // Create region-based S3 key (shared across users)
        const timestamp = Date.now();
        const fileId = `${timestamp}_${fileName}`;
        const s3Key = `${region}/${fileId}`;

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
                region,
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
 * GET /api/files/:fileId/download-url?region=UK|IRE
 */
export const getDownloadUrl = async (req, res, next) => {
    try {
        const { fileId } = req.params;
        const { region } = req.query;

        // Validate region
        const validRegions = ['UK', 'IRE'];
        if (!region || !validRegions.includes(region)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid region. Must be UK or IRE',
            });
        }

        // Construct S3 key with region
        const s3Key = `${region}/${fileId}`;

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
 * List all files from regional folders
 * GET /api/files?region=UK|IRE|all
 */
export const listFiles = async (req, res, next) => {
    try {
        const { region } = req.query;
        const validRegions = ['UK', 'IRE', 'all'];

        // Default to 'all' if not specified
        const selectedRegion = region || 'all';

        if (!validRegions.includes(selectedRegion)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid region. Must be UK, IRE, or all',
            });
        }

        let allFiles = [];

        // List files based on region selection
        if (selectedRegion === 'all') {
            // Fetch from both regions
            const ukFiles = await s3Service.listFiles('UK/');
            const ireFiles = await s3Service.listFiles('IRE/');
            allFiles = [...ukFiles, ...ireFiles];
        } else {
            // Fetch from specific region
            allFiles = await s3Service.listFiles(`${selectedRegion}/`);
        }

        // Transform file data for response
        const formattedFiles = allFiles.map(file => {
            // Extract region and fileId from key (e.g., "UK/123456_file.txt")
            const parts = file.key.split('/');
            const region = parts[0];
            const fileId = parts[1];
            // Extract fileName (remove timestamp prefix)
            const fileName = fileId.split('_').slice(1).join('_');

            return {
                key: file.key,
                fileId,
                fileName,
                region,
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
 * DELETE /api/files/:fileId?region=UK|IRE
 */
export const deleteFile = async (req, res, next) => {
    try {
        const { fileId } = req.params;
        const { region } = req.query;

        // Validate region
        const validRegions = ['UK', 'IRE'];
        if (!region || !validRegions.includes(region)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid region. Must be UK or IRE',
            });
        }

        // Construct S3 key with region
        const s3Key = `${region}/${fileId}`;

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
