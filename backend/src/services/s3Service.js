import {
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    ListObjectsV2Command,
    HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { awsConfig } from '../config/aws.js';

const { s3Client, bucketName } = awsConfig;

/**
 * Generate a pre-signed URL for uploading a file to S3
 * @param {string} key - The S3 object key
 * @param {string} contentType - The MIME type of the file
 * @param {number} expiresIn - URL expiration time in seconds
 * @returns {Promise<string>} Pre-signed upload URL
 */
export const generatePresignedUploadUrl = async (key, contentType, expiresIn = 300) => {
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
};

/**
 * Generate a pre-signed URL for downloading a file from S3
 * @param {string} key - The S3 object key
 * @param {number} expiresIn - URL expiration time in seconds
 * @returns {Promise<string>} Pre-signed download URL
 */
export const generatePresignedDownloadUrl = async (key, expiresIn = 3600) => {
    const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
};

/**
 * List files in S3 with a given prefix
 * @param {string} prefix - The S3 prefix to filter objects
 * @returns {Promise<Array>} Array of file objects
 */
export const listFiles = async (prefix = '') => {
    const command = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
    });

    const response = await s3Client.send(command);

    if (!response.Contents) {
        return [];
    }

    return response.Contents.map(item => ({
        key: item.Key,
        size: item.Size,
        lastModified: item.LastModified,
        etag: item.ETag,
    }));
};

/**
 * Delete a file from S3
 * @param {string} key - The S3 object key
 * @returns {Promise<Object>} Deletion result
 */
export const deleteFile = async (key) => {
    const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
    });

    const response = await s3Client.send(command);
    return response;
};

/**
 * Get metadata for a file in S3
 * @param {string} key - The S3 object key
 * @returns {Promise<Object>} File metadata
 */
export const getFileMetadata = async (key) => {
    const command = new HeadObjectCommand({
        Bucket: bucketName,
        Key: key,
    });

    const response = await s3Client.send(command);

    return {
        contentType: response.ContentType,
        contentLength: response.ContentLength,
        lastModified: response.LastModified,
        etag: response.ETag,
        metadata: response.Metadata,
    };
};

export default {
    generatePresignedUploadUrl,
    generatePresignedDownloadUrl,
    listFiles,
    deleteFile,
    getFileMetadata,
};
