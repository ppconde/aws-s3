# AWS S3 File Upload/Download API

A production-ready Node.js REST API for secure file uploads and downloads using AWS S3 pre-signed URLs with JWT authentication.

## Features

- ✅ **Pre-signed URLs** for direct client-to-S3 uploads/downloads
- ✅ **JWT Authentication** with bcrypt password hashing
- ✅ **User-specific file isolation** with S3 key prefixes
- ✅ **File management** (upload, download, list, delete, metadata)
- ✅ **Security** features (CORS, rate limiting, file validation)
- ✅ **Docker support** for containerized deployment
- ✅ **Health checks** for monitoring
- ✅ **AWS SDK v3** for optimal performance

## Documentation

- 📖 [API.md](API.md) - Complete API reference with request/response examples
- 🚀 [DEPLOYMENT.md](DEPLOYMENT.md) - AWS setup and deployment guide (EC2/ECS)
- 🧪 [POSTMAN.md](POSTMAN.md) - Postman collection usage and testing workflows

## Architecture

```
┌─────────┐      ┌─────────────┐      ┌──────────┐
│ Client  │─────▶│   Express   │─────▶│   AWS    │
│         │◀─────│   API       │◀─────│   S3     │
└─────────┘      └─────────────┘      └──────────┘
    │                  │                     │
    │  1. Get URL      │                     │
    │◀─────────────────│                     │
    │                  │                     │
    │  2. Upload/Download directly           │
    │────────────────────────────────────────▶│
```

**Flow:**
1. Client authenticates and receives JWT token
2. Client requests pre-signed URL from API
3. API generates pre-signed URL using AWS SDK
4. Client uploads/downloads file directly to/from S3
5. No file data passes through API server (bandwidth efficient)

## Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (or npm/yarn)
- AWS Account with S3 bucket
- AWS IAM credentials with S3 permissions

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd aws-s3
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your AWS credentials:
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET_NAME=your-bucket-name
JWT_SECRET=your_secure_random_string
```

4. **Start the server**
```bash
# Development mode (with auto-reload)
pnpm dev

# Production mode
pnpm start
```

The server will start on `http://localhost:3000`

## API Usage

### 1. Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

Response includes JWT token - use this for authenticated requests.

### 3. Get Upload URL
```bash
curl -X POST http://localhost:3000/api/files/upload-url \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "fileName": "document.pdf"
  }'
```

**Note:** Content type is automatically detected from file extension. You can also specify it explicitly with `"contentType": "application/pdf"`.

### 4. Upload File to S3
```bash
curl -X PUT "PRESIGNED_UPLOAD_URL" \
  -H "Content-Type: application/pdf" \
  --data-binary @document.pdf
```

### 5. List Your Files
```bash
curl http://localhost:3000/api/files \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

For complete API documentation, see [API.md](API.md)

## Docker Deployment

### Build and Run with Docker Compose

```bash
# Build and start
docker-compose up --build

# Run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Build Docker Image

```bash
docker build -t s3-upload-api .
docker run -p 3000:3000 --env-file .env s3-upload-api
```

## AWS Setup

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions on:
- Creating and configuring S3 bucket
- Setting up IAM roles and policies
- Deploying to EC2/ECS
- Security best practices

## Project Structure

```
aws-s3/
├── src/
│   ├── config/
│   │   ├── aws.js              # AWS S3 client configuration
│   │   └── auth.js             # JWT configuration
│   ├── middleware/
│   │   ├── auth.js             # JWT authentication middleware
│   │   └── errorHandler.js    # Global error handler
│   ├── routes/
│   │   ├── auth.routes.js      # Authentication endpoints
│   │   └── files.routes.js     # File operation endpoints
│   ├── controllers/
│   │   ├── authController.js   # Auth logic
│   │   └── filesController.js  # File operations logic
│   ├── services/
│   │   └── s3Service.js        # S3 SDK wrapper
│   ├── utils/
│   │   └── validators.js       # Input validation
│   ├── app.js                  # Express app setup
│   └── server.js               # Server entry point
├── .env.example                # Environment template
├── .gitignore
├── .nvmrc                      # Node.js version
├── Dockerfile
├── docker-compose.yml
├── iam-policy.json            # Required IAM permissions
├── postman-collection.json    # Postman API testing collection
├── package.json
├── README.md                  # This file
├── API.md                     # API documentation
├── DEPLOYMENT.md              # Deployment guide
└── POSTMAN.md                 # Postman testing guide
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `AWS_REGION` | AWS region | `us-east-1` |
| `AWS_ACCESS_KEY_ID` | AWS access key | - |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | - |
| `AWS_S3_BUCKET_NAME` | S3 bucket name | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | Token expiration | `24h` |
| `MAX_FILE_SIZE` | Max file size (bytes) | `10485760` (10MB) |
| `ALLOWED_FILE_TYPES` | Allowed MIME types | See `.env.example` |
| `PRESIGNED_URL_UPLOAD_EXPIRES` | Upload URL expiry (seconds) | `300` (5 min) |
| `PRESIGNED_URL_DOWNLOAD_EXPIRES` | Download URL expiry (seconds) | `3600` (1 hour) |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:3000` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

## Security Features

- **Pre-signed URLs**: Files transfer directly between client and S3
- **JWT Authentication**: Stateless token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **User Isolation**: Files stored in user-specific S3 prefixes
- **Input Validation**: File type, size, and name sanitization
- **Rate Limiting**: Prevent abuse and DoS attacks
- **CORS**: Configurable allowed origins
- **Non-root Docker User**: Container runs as unprivileged user

## Development

```bash
# Install dependencies
pnpm install

# Run in development mode (auto-reload)
pnpm dev

# Run in production mode
pnpm start
```

## Testing

### Postman Collection

A complete Postman collection is included for easy testing:

1. **Import** `postman-collection.json` into Postman
2. **Run requests** in order: Health Check → Register → Get Upload URL → Upload File → List Files
3. **Automated tests** verify responses and save tokens/URLs automatically

See [POSTMAN.md](POSTMAN.md) for detailed testing workflow and tips.

### cURL Examples

Test endpoints using curl. See [API.md](API.md) for complete examples.

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
