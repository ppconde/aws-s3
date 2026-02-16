/**
 * Map of file extensions to MIME types
 */
const mimeTypeMap = {
    // Images
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'ico': 'image/x-icon',
    'bmp': 'image/bmp',

    // Documents
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',

    // Text
    'txt': 'text/plain',
    'md': 'text/markdown',
    'markdown': 'text/markdown',
    'html': 'text/html',
    'htm': 'text/html',
    'css': 'text/css',
    'csv': 'text/csv',
    'xml': 'text/xml',

    // Code
    'js': 'application/javascript',
    'json': 'application/json',
    'ts': 'application/typescript',

    // Archives
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    'tar': 'application/x-tar',
    'gz': 'application/gzip',

    // Audio
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'm4a': 'audio/mp4',

    // Video
    'mp4': 'video/mp4',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
    'wmv': 'video/x-ms-wmv',
    'flv': 'video/x-flv',
    'webm': 'video/webm',
};

/**
 * Get MIME type from file extension
 * @param {string} fileName - The file name
 * @returns {string|null} MIME type or null if unknown
 */
export const getMimeType = (fileName) => {
    if (!fileName) return null;

    const extension = fileName.split('.').pop().toLowerCase();
    return mimeTypeMap[extension] || null;
};

/**
 * Get file extension from file name
 * @param {string} fileName - The file name
 * @returns {string|null} File extension or null
 */
export const getFileExtension = (fileName) => {
    if (!fileName) return null;

    const parts = fileName.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : null;
};

/**
 * Validate that content type matches file extension
 * @param {string} fileName - The file name
 * @param {string} contentType - The content type to validate
 * @returns {boolean} True if they match
 */
export const validateContentType = (fileName, contentType) => {
    const expectedType = getMimeType(fileName);
    return expectedType === contentType;
};

export default {
    getMimeType,
    getFileExtension,
    validateContentType,
};
