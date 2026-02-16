# Deployment Guide

Complete guide to deploying the AWS S3 File Upload/Download API to production environments.

## Table of Contents

1. [AWS Setup](#aws-setup)
2. [Local Development](#local-development)
3. [Docker Deployment](#docker-deployment)
4. [AWS EC2 Deployment](#aws-ec2-deployment)
5. [AWS ECS Deployment](#aws-ecs-deployment)
6. [Security Best Practices](#security-best-practices)
7. [Monitoring](#monitoring)

---

## AWS Setup

### 1. Create S3 Bucket

1. **Login to AWS Console** and navigate to S3
2. **Click "Create bucket"**
3. **Configure bucket:**
   - Bucket name: `your-app-uploads` (must be globally unique)
   - Region: Choose your preferred region (e.g., `us-east-1`)
   - Block all public access: ✅ **Keep enabled** (we'll use pre-signed URLs)
   - Bucket versioning: Optional (recommended for production)
   - Encryption: Enable default encryption (AES-256 or KMS)

4. **CORS Configuration:**
   Navigate to bucket → Permissions → CORS and add:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

**Production:** Replace `"*"` in `AllowedOrigins` with your actual domain(s).

### 2. Create IAM User for API

1. **Navigate to IAM** → Users → Add users
2. **User name:** `s3-upload-api-user`
3. **Access type:** Programmatic access
4. **Permissions:** Attach policies directly → Create policy

**IAM Policy:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3BucketAccess",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetBucketLocation"
      ],
      "Resource": "arn:aws:s3:::your-app-uploads"
    },
    {
      "Sid": "S3ObjectAccess",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:GetObjectAcl",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::your-app-uploads/*"
    }
  ]
}
```

**Important:** Replace `your-app-uploads` with your actual bucket name.

5. **Save credentials:**
   - Access Key ID
   - Secret Access Key
   - Store these securely - you'll need them for `.env`

**Note:** Use the provided `iam-policy.json` file as a template.

### 3. Verify AWS Configuration

Test your credentials locally:

```bash
# Set environment variables
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=us-east-1

# Test with AWS CLI (optional)
aws s3 ls s3://your-app-uploads
```

---

## Local Development

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- AWS credentials

### Setup

1. **Clone repository:**
```bash
git clone <repository-url>
cd aws-s3
```

2. **Install dependencies:**
```bash
pnpm install
```

3. **Configure environment:**
```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=3000
NODE_ENV=development

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_S3_BUCKET_NAME=your-app-uploads

JWT_SECRET=generate_a_secure_random_string
JWT_EXPIRES_IN=24h

MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf

PRESIGNED_URL_UPLOAD_EXPIRES=300
PRESIGNED_URL_DOWNLOAD_EXPIRES=3600

ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

4. **Start server:**
```bash
pnpm dev
```

5. **Test health check:**
```bash
curl http://localhost:3000/health
```

---

## Docker Deployment

### Build and Run Locally

1. **Build image:**
```bash
docker build -t s3-upload-api .
```

2. **Run container:**
```bash
docker run -p 3000:3000 --env-file .env s3-upload-api
```

### Using Docker Compose

1. **Start services:**
```bash
docker-compose up -d
```

2. **View logs:**
```bash
docker-compose logs -f
```

3. **Stop services:**
```bash
docker-compose down
```

### Push to Docker Registry

**Docker Hub:**
```bash
docker tag s3-upload-api:latest yourusername/s3-upload-api:latest
docker push yourusername/s3-upload-api:latest
```

**AWS ECR:**
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com

# Create repository
aws ecr create-repository --repository-name s3-upload-api --region us-east-1

# Tag and push
docker tag s3-upload-api:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/s3-upload-api:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/s3-upload-api:latest
```

---

## AWS EC2 Deployment

### 1. Launch EC2 Instance

1. **Choose AMI:** Amazon Linux 2 or Ubuntu 22.04
2. **Instance type:** t3.micro (free tier) or larger
3. **Configure Security Group:**
   - SSH (22) - Your IP only
   - HTTP (80) - Anywhere
   - HTTPS (443) - Anywhere
   - Custom TCP (3000) - Anywhere (or use reverse proxy)

4. **Create/Select Key Pair** for SSH access

### 2. Connect to Instance

```bash
ssh -i your-key.pem ec2-user@your-instance-ip
```

### 3. Install Dependencies

**Amazon Linux 2:**
```bash
# Update system
sudo yum update -y

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install pnpm
sudo npm install -g pnpm

# Install Docker (optional)
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user
```

**Ubuntu:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
sudo npm install -g pnpm

# Install Docker (optional)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker ubuntu
```

### 4. Deploy Application

**Option A: Direct Node.js**

```bash
# Clone repository
git clone <repository-url>
cd aws-s3

# Install dependencies
pnpm install

# Create .env file
nano .env
# Paste your environment variables

# Install PM2 for process management
sudo npm install -g pm2

# Start application
pm2 start src/server.js --name s3-api

# Setup auto-restart on reboot
pm2 startup
pm2 save
```

**Option B: Docker**

```bash
# Clone repository
git clone <repository-url>
cd aws-s3

# Create .env file
nano .env

# Build and run with Docker Compose
docker-compose up -d

# Setup auto-restart
sudo systemctl enable docker
```

### 5. Setup Reverse Proxy (Nginx)

```bash
# Install Nginx
sudo yum install -y nginx  # Amazon Linux
# or
sudo apt install -y nginx  # Ubuntu

# Configure Nginx
sudo nano /etc/nginx/conf.d/s3-api.conf
```

Add configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Test configuration
sudo nginx -t

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 6. Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo yum install -y certbot python3-certbot-nginx  # Amazon Linux
# or
sudo apt install -y certbot python3-certbot-nginx  # Ubuntu

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
```

---

## AWS ECS Deployment

### 1. Create ECS Cluster

```bash
aws ecs create-cluster --cluster-name s3-upload-cluster
```

### 2. Create Task Definition

Create `task-definition.json`:

```json
{
  "family": "s3-upload-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "s3-upload-api",
      "image": "123456789012.dkr.ecr.us-east-1.amazonaws.com/s3-upload-api:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {"name": "NODE_ENV", "value": "production"},
        {"name": "PORT", "value": "3000"}
      ],
      "secrets": [
        {"name": "AWS_ACCESS_KEY_ID", "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789012:secret:s3-api/aws-access-key"},
        {"name": "AWS_SECRET_ACCESS_KEY", "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789012:secret:s3-api/aws-secret-key"},
        {"name": "JWT_SECRET", "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789012:secret:s3-api/jwt-secret"}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/s3-upload-api",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

Register task definition:
```bash
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

### 3. Create Service

```bash
aws ecs create-service \
  --cluster s3-upload-cluster \
  --service-name s3-upload-service \
  --task-definition s3-upload-api \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345,subnet-67890],securityGroups=[sg-12345],assignPublicIp=ENABLED}"
```

### 4. Setup Application Load Balancer

Follow AWS documentation to create an ALB and target group for your ECS service.

---

## Security Best Practices

### 1. Environment Variables

- **Never commit `.env` files** to version control
- Use **AWS Secrets Manager** or **Parameter Store** in production
- Rotate credentials regularly

### 2. S3 Security

- **Block public access** - Use pre-signed URLs only
- **Enable versioning** - Recover from accidental deletions
- **Enable logging** - Track S3 access
- **Encryption at rest** - Enable default encryption

### 3. Application Security

- **Use HTTPS** in production (TLS 1.2+)
- **Strong JWT secrets** - Use cryptographically random strings
- **Rate limiting** - Prevent abuse
- **Input validation** - Sanitize all user inputs
- **CORS** - Restrict to known origins
- **Security headers** - Add helmet.js middleware

### 4. Network Security

- **Security groups** - Restrict inbound traffic
- **VPC** - Use private subnets for ECS tasks
- **WAF** - Add Web Application Firewall for additional protection

### 5. Monitoring

- **CloudWatch Logs** - Centralized logging
- **CloudWatch Alarms** - Alert on errors/high latency
- **X-Ray** - Distributed tracing (optional)

---

## Monitoring

### CloudWatch Logs

**EC2:**
```bash
# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U ./amazon-cloudwatch-agent.rpm

# Configure and start agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -s \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/config.json
```

**ECS:**
Logs are automatically sent to CloudWatch with the configuration in task definition.

### Health Checks

The application includes a `/health` endpoint:

```bash
curl http://your-instance-ip:3000/health
```

Configure load balancer health checks to use this endpoint.

### Metrics to Monitor

- Response time
- Error rate (4xx, 5xx)
- Request count
- CPU/Memory usage
- S3 operation latency

---

## Troubleshooting

### Common Issues

**1. AWS Credentials Error**
```
Error: InvalidAccessKeyId
```
- Verify credentials in `.env`
- Check IAM permissions
- Ensure credentials aren't expired

**2. S3 Access Denied**
```
Error: AccessDenied
```
- Check IAM policy includes required permissions
- Verify bucket name is correct
- Ensure bucket exists in specified region

**3. CORS Errors**
- Configure S3 bucket CORS settings
- Add allowed origins to `.env`
- Verify Content-Type headers

**4. JWT Token Expired**
- Tokens expire after configured time
- Re-authenticate to get new token

### Logs

**PM2 logs:**
```bash
pm2 logs s3-api
```

**Docker logs:**
```bash
docker-compose logs -f
```

**CloudWatch Logs:**
Navigate to CloudWatch → Log groups → Your log group

---

## Maintenance

### Updating the Application

**PM2:**
```bash
git pull
pnpm install
pm2 restart s3-api
```

**Docker:**
```bash
docker-compose down
git pull
docker-compose up --build -d
```

**ECS:**
```bash
# Push new image to ECR
docker build -t s3-upload-api .
docker tag s3-upload-api:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/s3-upload-api:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/s3-upload-api:latest

# Update service to use new task definition
aws ecs update-service --cluster s3-upload-cluster --service s3-upload-service --force-new-deployment
```

### Backup

- **S3 versioning** - Enable for automatic backups
- **User data** - Backup in-memory user store to database (upgrade from MVP)

---

## Cost Optimization

- Use **S3 Intelligent-Tiering** for infrequent files
- **CloudFront CDN** for frequently accessed files
- **Reserved instances** for predictable workloads
- **Auto-scaling** for variable traffic

---

## Support

For issues or questions:
- Check logs first
- Review environment variables
- Verify AWS permissions
- Test with curl/Postman
