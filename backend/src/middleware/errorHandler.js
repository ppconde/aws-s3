export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Default error
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // AWS SDK errors
    if (err.name === 'NoSuchKey') {
        statusCode = 404;
        message = 'File not found';
    } else if (err.name === 'AccessDenied') {
        statusCode = 403;
        message = 'Access denied to S3 resource';
    } else if (err.name === 'InvalidAccessKeyId' || err.name === 'SignatureDoesNotMatch') {
        statusCode = 500;
        message = 'AWS credentials error';
    }

    // Multer errors (file upload)
    if (err.name === 'MulterError') {
        statusCode = 400;
        if (err.code === 'LIMIT_FILE_SIZE') {
            message = 'File size exceeds the maximum allowed limit';
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            message = 'Unexpected file field';
        }
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = err.message;
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

export default errorHandler;
