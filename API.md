# API Documentation

Complete API reference for the AWS S3 File Upload/Download API.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Response Format

All responses follow this format:

```json
{
  "success": true|false,
  "message": "Description of the result",
  "data": { ... } // Optional, contains response data
}
```

## Endpoints

### Authentication

#### Register User

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_1234567890_abc123",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Validation Rules:**
- Email must be valid format
- Password must be at least 6 characters
- Name is required

**Error Responses:**
- `400 Bad Request` - Invalid input
- `409 Conflict` - Email already exists

---

#### Login

Authenticate and receive JWT token.

**Endpoint:** `POST /api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_1234567890_abc123",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400 Bad Request` - Missing email or password
- `401 Unauthorized` - Invalid credentials

---

### File Operations

All file endpoints require authentication.

#### Get Upload URL

Generate a pre-signed URL for uploading a file to S3.

**Endpoint:** `POST /api/files/upload-url`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**
```json
{
  "fileName": "document.pdf",
  "contentType": "application/pdf",
  "fileSize": 1048576
}
```

**Field Descriptions:**
- `fileName` (required) - Name of the file with extension
- `contentType` (optional) - MIME type. Auto-detected from file extension if not provided
- `fileSize` (optional) - Size of the file in bytes

**Examples:**

Auto-detect content type:
```json
{
  "fileName": "photo.jpg",
  "fileSize": 2048000
}
```
The API will automatically set `contentType` to `image/jpeg`.

Explicit content type:
```json
{
  "fileName": "document.pdf",
  "contentType": "application/pdf",
  "fileSize": 1048576
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Upload URL generated successfully",
  "data": {
    "uploadUrl": "https://your-bucket.s3.amazonaws.com/users/user_123/1234567890_document.pdf?X-Amz-Algorithm=...",
    "fileId": "1234567890_document.pdf",
    "key": "users/user_123/1234567890_document.pdf",
    "contentType": "application/pdf",
    "expiresIn": 300
  }
}
```

**Usage:**
After receiving the upload URL, use it to upload the file directly to S3. **The Content-Type header must match the contentType from the response:**

```bash
curl -X PUT "UPLOAD_URL" \
  -H "Content-Type: application/pdf" \
  --data-binary @document.pdf
```

**Validation Rules:**
- `fileName` is required and will be sanitized
- `contentType` is optional - automatically determined from file extension if not provided
- If `contentType` is provided, it must match the file extension
- `contentType` must match allowed file types (if configured in ALLOWED_FILE_TYPES)
- `fileSize` must not exceed MAX_FILE_SIZE (if configured)

**Error Responses:**
- `400 Bad Request` - Invalid input, file type not allowed, or content type mismatch
- `401 Unauthorized` - Invalid or missing token

---

#### Get Download URL

Generate a pre-signed URL for downloading a file from S3.

**Endpoint:** `GET /api/files/:fileId/download-url`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**URL Parameters:**
- `fileId` - The file identifier (returned when getting upload URL)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Download URL generated successfully",
  "data": {
    "downloadUrl": "https://your-bucket.s3.amazonaws.com/users/user_123/1234567890_document.pdf?X-Amz-Algorithm=...",
    "fileId": "1234567890_document.pdf",
    "expiresIn": 3600
  }
}
```

**Usage:**
Use the download URL to retrieve the file:

```bash
curl "DOWNLOAD_URL" -o downloaded_file.pdf
```

**Error Responses:**
- `400 Bad Request` - Invalid fileId
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - File doesn't exist

---

#### List Files

Get a list of all files for the authenticated user.

**Endpoint:** `GET /api/files`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Files retrieved successfully",
  "data": {
    "files": [
      {
        "fileId": "1234567890_document.pdf",
        "name": "document.pdf",
        "size": 1048576,
        "lastModified": "2026-02-16T10:30:00.000Z"
      },
      {
        "fileId": "1234567891_image.jpg",
        "name": "image.jpg",
        "size": 524288,
        "lastModified": "2026-02-16T11:00:00.000Z"
      }
    ],
    "count": 2
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token

---

#### Delete File

Delete a file from S3.

**Endpoint:** `DELETE /api/files/:fileId`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**URL Parameters:**
- `fileId` - The file identifier

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "File deleted successfully",
  "data": {
    "fileId": "1234567890_document.pdf"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid fileId
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - File doesn't exist

---

#### Get File Metadata

Get metadata for a specific file without downloading it.

**Endpoint:** `GET /api/files/:fileId/metadata`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**URL Parameters:**
- `fileId` - The file identifier

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "File metadata retrieved successfully",
  "data": {
    "fileId": "1234567890_document.pdf",
    "name": "document.pdf",
    "contentType": "application/pdf",
    "size": 1048576,
    "lastModified": "2026-02-16T10:30:00.000Z",
    "etag": "\"33a64df551425fcc55e4d42a148795d9f25f89d4\""
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid fileId
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - File doesn't exist

---

### Health Check

Check if the server is running.

**Endpoint:** `GET /health`

**Headers:** None required

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-02-16T12:00:00.000Z"
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request - Invalid input |
| `401` | Unauthorized - Invalid or missing token |
| `403` | Forbidden - Access denied |
| `404` | Not Found - Resource doesn't exist |
| `409` | Conflict - Resource already exists |
| `429` | Too Many Requests - Rate limit exceeded |
| `500` | Internal Server Error |

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Window:** 15 minutes (configurable)
- **Max Requests:** 100 per window (configurable)

When rate limit is exceeded, you'll receive a `429 Too Many Requests` response:

```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later."
}
```

## Example Workflow

### Complete Upload/Download Flow

1. **Register a user:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

2. **Login and save token:**
```bash
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  | jq -r '.data.token')
```

3. **Get upload URL:**
```bash
UPLOAD_DATA=$(curl -X POST http://localhost:3000/api/files/upload-url \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"fileName":"test.pdf","contentType":"application/pdf"}')

UPLOAD_URL=$(echo $UPLOAD_DATA | jq -r '.data.uploadUrl')
FILE_ID=$(echo $UPLOAD_DATA | jq -r '.data.fileId')
```

4. **Upload file to S3:**
```bash
curl -X PUT "$UPLOAD_URL" \
  -H "Content-Type: application/pdf" \
  --data-binary @test.pdf
```

5. **List files:**
```bash
curl http://localhost:3000/api/files \
  -H "Authorization: Bearer $TOKEN"
```

6. **Get download URL:**
```bash
DOWNLOAD_URL=$(curl http://localhost:3000/api/files/$FILE_ID/download-url \
  -H "Authorization: Bearer $TOKEN" \
  | jq -r '.data.downloadUrl')
```

7. **Download file:**
```bash
curl "$DOWNLOAD_URL" -o downloaded_test.pdf
```

8. **Delete file:**
```bash
curl -X DELETE http://localhost:3000/api/files/$FILE_ID \
  -H "Authorization: Bearer $TOKEN"
```

## Best Practices

1. **Store tokens securely** - Never expose JWT tokens in client-side code
2. **Use HTTPS in production** - Encrypt all communications
3. **Set appropriate file size limits** - Prevent abuse
4. **Validate file types** - Only allow necessary file types
5. **Monitor rate limits** - Implement exponential backoff for retries
6. **Handle pre-signed URL expiration** - Request new URLs if expired
7. **Clean up failed uploads** - Implement cleanup logic for incomplete uploads
