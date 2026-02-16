# AWS S3 File Upload/Download Full Stack Application

A complete full-stack application for secure file uploads and downloads using AWS S3 pre-signed URLs, featuring a React TypeScript frontend and Node.js Express backend with JWT authentication.

## 🏗️ Architecture

```
┌──────────────┐      ┌──────────────┐      ┌──────────┐
│   React UI   │─────▶│   Express    │─────▶│   AWS    │
│  TypeScript  │◀─────│   Backend    │◀─────│   S3     │
└──────────────┘      └──────────────┘      └──────────┘
       │                      │                     │
       │  1. Auth & Get URL   │                     │
       │◀─────────────────────│                     │
       │                      │                     │
       │  2. Upload/Download directly to/from S3    │
       │─────────────────────────────────────────────▶│
```

## ✨ Features

### Backend
- ✅ **Pre-signed URLs** for direct client-to-S3 uploads/downloads
- ✅ **JWT Authentication** with bcrypt password hashing
- ✅ **User-specific file isolation** with S3 key prefixes
- ✅ **File management** (upload, download, list, delete)
- ✅ **Auto content-type detection** from file extensions
- ✅ **Security** features (CORS, rate limiting, file validation)
- ✅ **AWS SDK v3** for optimal performance

### Frontend
- ✅ **React 18** with **TypeScript**
- ✅ **Modern UI** with responsive design
- ✅ **User authentication** (login/register)
- ✅ **File upload** with progress indication
- ✅ **File listing** with metadata (size, date)
- ✅ **Download** files directly from S3
- ✅ **Delete** files with confirmation
- ✅ **Token management** with localStorage

## 📁 Project Structure

```
aws-s3/
├── backend/                 # Express API server
│   ├── src/
│   │   ├── config/         # AWS and auth configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Auth and error handling
│   │   ├── routes/         # API routes
│   │   ├── services/       # S3 service layer
│   │   └── utils/          # Validators and helpers
│   ├── package.json
│   └── .env
├── frontend/               # React TypeScript UI
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API service
│   │   ├── types/          # TypeScript interfaces
│   │   └── App.tsx         # Main app component
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- AWS Account with S3 bucket
- AWS IAM credentials with S3 permissions

### 1. Backend Setup

```bash
cd backend

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your AWS credentials

# Start backend server
pnpm run dev
```

The backend will start on `http://localhost:3000`

**Backend Environment Variables:**
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET_NAME=your-bucket-name
JWT_SECRET=your_secret_key
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

The frontend will start on `http://localhost:5173`

### 3. AWS Setup

See [backend/DEPLOYMENT.md](backend/DEPLOYMENT.md) for detailed AWS setup instructions:
- Creating S3 bucket
- Configuring CORS
- Setting up IAM user and permissions

## 📝 Usage

### 1. Access the Application
Open `http://localhost:5173` in your browser

### 2. Register/Login
- Create a new account or login with existing credentials
- JWT token is automatically stored in localStorage

### 3. Upload Files
- Click "Select File" and choose a file
- Content type is automatically detected from file extension
- File uploads directly to S3 (no server bandwidth used)

### 4. Manage Files
- View all your files with metadata
- Download files directly from S3
- Delete files with confirmation

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **User Isolation**: Files are stored per user in S3
- **Pre-signed URLs**: Time-limited, secure S3 access
- **CORS Protection**: Configurable allowed origins
- **File Validation**: Content type and size limits
- **Private S3 Bucket**: All files private by default

## 🛠️ Development

### Backend Development
```bash
cd backend
pnpm run dev  # Auto-reload on changes
```

### Frontend Development
```bash
cd frontend
pnpm run dev  # Hot module replacement
```

### Build for Production

**Backend:**
```bash
cd backend
pnpm start
```

**Frontend:**
```bash
cd frontend
pnpm run build
pnpm run preview
```

## 📚 API Documentation

See [backend/API.md](backend/API.md) for complete API reference including:
- Authentication endpoints
- File management endpoints
- Request/response examples
- Error codes

## 🧪 Testing with Postman

A complete Postman collection is available in `backend/postman-collection.json`

See [backend/POSTMAN.md](backend/POSTMAN.md) for:
- Setup instructions
- Testing workflows
- Environment configuration

## 🚢 Deployment

See [backend/DEPLOYMENT.md](backend/DEPLOYMENT.md) for production deployment guides:
- Docker deployment
- AWS EC2 deployment
- AWS ECS deployment
- Security best practices

## 📦 Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Authentication**: JWT + bcryptjs
- **AWS SDK**: @aws-sdk/client-s3 v3
- **Language**: JavaScript (ES modules)

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: CSS (Custom design)
- **State Management**: React hooks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

MIT

## 🆘 Support

For issues and questions:
- Check [backend/API.md](backend/API.md) for API documentation
- See [backend/DEPLOYMENT.md](backend/DEPLOYMENT.md) for setup help
- Review [backend/POSTMAN.md](backend/POSTMAN.md) for testing guidance

## 🎯 Roadmap

- [ ] User profile management
- [ ] File sharing with other users
- [ ] File preview (images, PDFs)
- [ ] Folder organization
- [ ] Search and filtering
- [ ] Upload progress tracking
- [ ] Drag & drop upload
- [ ] Database integration (PostgreSQL/MongoDB)
