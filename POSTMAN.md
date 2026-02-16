# Postman Testing Guide

This guide explains how to use the Postman collection to test the AWS S3 Upload/Download API.

## Setup

### 1. Import Collection

1. Open Postman
2. Click **Import** button
3. Select `postman-collection.json`
4. Collection will appear in the left sidebar

### 2. Import and Activate Environment (REQUIRED)

⚠️ **Important:** You must import and activate the environment for authentication to work.

1. Click **Import** button again
2. Select `postman/environments/local.postman_environment.json`
3. Click the environment dropdown in the top-right corner
4. Select **"Local Development"**
5. Verify it shows "Local Development" (not "No Environment")

**Environment Variables:**
- `base_url` - API base URL (default: `http://localhost:3000`)
- `test_email` - Test user email
- `test_password` - Test user password
- `test_name` - Test user name
- `jwt_token` - JWT token (auto-populated after login) **← Required for authentication**
- `file_id` - File ID (auto-populated after upload URL request)
- `upload_url` - Pre-signed upload URL (auto-populated)
- `download_url` - Pre-signed download URL (auto-populated)

### 3. Verify Environment is Active

Before making requests, ensure:
- The environment dropdown shows **"Local Development"** (top-right)
- OR create a new environment with at least the `jwt_token` variable

## Folder Structure

```
AWS S3 Upload/Download API
├── Health Check
├── Authentication
│   ├── Register User
│   └── Login
├── File Operations
│   ├── 1. Get Upload URL
│   ├── 2. Upload File to S3 (Manual)
│   ├── 3. List Files
│   ├── 4. Get File Metadata
│   ├── 5. Get Download URL
│   ├── 6. Download File from S3 (Manual)
│   └── 7. Delete File
└── Error Scenarios
    ├── Unauthorized - No Token
    ├── Invalid File ID
    ├── File Not Found
    └── Invalid Login Credentials
```

## Testing Workflow

### Complete Upload/Download Flow

Follow this sequence to test the full workflow:

#### Step 1: Health Check
1. Run **Health Check**
2. Verify server is running (200 OK)

#### Step 2: Register or Login
1. Run **Register User** (first time)
   - Creates new user account
   - Automatically saves JWT token
2. Or run **Login** (subsequent times)
   - Authenticates existing user
   - Automatically saves JWT token

#### Step 3: Get Upload URL
1. Run **File Operations → 1. Get Upload URL**
2. Modify request body if needed:
   ```json
   {
     "fileName": "my-document.pdf",
     "fileSize": 1024000
   }
   ```
   **Note:** `contentType` is automatically detected from the file extension (.pdf → application/pdf)
3. Response saves `upload_url`, `file_id`, and `content_type` automatically

#### Step 4: Upload File to S3
1. Open **File Operations → 2. Upload File to S3 (Manual)**
2. In **Body** tab, select **binary** (or **file**)
3. Click **Select File** and choose a file matching the extension from step 3
4. **Content-Type header is automatically set** from step 3 response
5. Click **Send**
6. Successful upload returns 200 OK

#### Step 5: List Files
1. Run **File Operations → 3. List Files**
2. Verify your uploaded file appears in the list

#### Step 6: Get File Metadata
1. Run **File Operations → 4. Get File Metadata**
2. Uses the `file_id` from step 3
3. Shows file size, content type, last modified, etc.

#### Step 7: Get Download URL
1. Run **File Operations → 5. Get Download URL**
2. Response saves `download_url` automatically

#### Step 8: Download File
1. Open **File Operations → 6. Download File from S3 (Manual)**
2. Click **Send and Download** button
3. File downloads to your system

#### Step 9: Delete File
1. Run **File Operations → 7. Delete File**
2. Verify file is deleted (200 OK)
3. Run **List Files** again to confirm removal

## Automated Tests

Each request includes automated tests that verify:

### Authentication Requests
- ✅ Correct status codes (201 for register, 200 for login)
- ✅ Response contains JWT token
- ✅ Token is automatically saved to environment

### File Operations
- ✅ Status code is 200
- ✅ Response contains expected data
- ✅ Pre-signed URLs are valid
- ✅ File IDs are captured

### Error Scenarios
- ✅ Unauthorized access returns 401
- ✅ Invalid file IDs return 400/404
- ✅ Invalid credentials return 401

### Global Tests
- ✅ All responses complete within 2 seconds

## Testing Different File Types

### Images
```json
{
  "fileName": "photo.jpg",
  "contentType": "image/jpeg",
  "fileSize": 2048000
}
```

### Documents
```json
{
  "fileName": "document.pdf",
  "contentType": "application/pdf",
  "fileSize": 1024000
}
```

### Text Files
```json
{
  "fileName": "notes.txt",
  "contentType": "text/plain",
  "fileSize": 5120
}
```

## Error Scenario Testing

The **Error Scenarios** folder includes tests for:

### 1. Unauthorized Access
- Tests accessing protected endpoints without authentication
- Expects 401 status

### 2. Invalid File ID
- Tests path traversal attacks (`../`)
- Tests malformed file IDs
- Expects 400 status

### 3. File Not Found
- Tests accessing non-existent files
- Expects 404 status

### 4. Invalid Credentials
- Tests login with wrong password
- Expects 401 status

## Tips & Tricks

### 1. Using Collection Variables

Access variables in requests:
```
{{base_url}}/api/files/{{file_id}}
```

### 2. Manual Variable Setting

Set variables manually in **Tests** tab:
```javascript
pm.environment.set('custom_var', 'value');
```

### 3. View Console Logs

Open **Postman Console** (bottom left icon) to see:
- Request/response details
- Test results
- Console.log outputs

### 4. Run Collection with Runner

1. Click **Run** button on collection
2. Select all or specific requests
3. Set iterations and delay
4. View test results in runner

### 5. Export Test Results

After running collection:
1. Click **Export Results**
2. Share with team or save for records

## Environment Setup for Different Stages

### Local Development
```
base_url = http://localhost:3000
```

### Staging
```
base_url = https://staging-api.yourdomain.com
```

### Production
```
base_url = https://api.yourdomain.com
```

## Testing with Different Users

To test multi-user scenarios:

1. Register User A
   - Update `test_email` to `usera@example.com`
   - Run **Register User**
   - Upload files

2. Register User B
   - Update `test_email` to `userb@example.com`
   - Run **Register User**
   - Upload files

3. Verify Isolation
   - Login as User A
   - Run **List Files**
   - Should only see User A's files

## Troubleshooting

### "Invalid token. Access denied" Error

If you get this error even after logging in:

**Most Common Cause:** No environment is activated

1. **Check environment dropdown** (top-right corner)
   - If it says "No Environment" → **This is the problem!**
   - Click dropdown and select **"Local Development"**

2. **Re-login after activating environment:**
   - Run **Authentication → Login**
   - Check Postman Console - you should see "JWT Token saved: ..."
   - Verify `jwt_token` variable is populated in environment

3. **Verify the token is being used:**
   - In request, mouse-over `{{jwt_token}}` - it should show the actual token value
   - If it shows `{{jwt_token}}` literally, the environment isn't active

**Quick Fix:**
```
1. Activate environment: "Local Development" (top-right dropdown)
2. Run: Authentication → Login
3. Run: File Operations → 3. List Files
```

### Token Expired
If you get 401 errors after some time:
1. Run **Login** again to refresh token
2. Token expiration is configured in `.env` (default 24h)

### Upload URL Expired
Pre-signed upload URLs expire after 5 minutes:
1. Run **Get Upload URL** again
2. Immediately upload the file

### Download URL Expired
Pre-signed download URLs expire after 1 hour:
1. Run **Get Download URL** again
2. Use new URL to download

### Wrong Content-Type
If upload fails:
1. The `Content-Type` header is automatically set from step 1 response (via `{{content_type}}` variable)
2. Ensure the file you're uploading matches the extension you specified in step 1
3. Example: If you requested upload URL for "document.pdf", upload an actual PDF file

### File ID Not Found
If file operations fail:
1. Verify `file_id` environment variable is set
2. Run **List Files** to see available file IDs
3. Manually set `file_id` variable if needed

## Advanced Usage

### Pre-request Scripts

Add custom logic before requests:
```javascript
// Generate random filename
const timestamp = new Date().getTime();
pm.environment.set('dynamic_filename', `file_${timestamp}.pdf`);
```

### Chain Requests

Tests can prepare data for next request:
```javascript
// In Upload URL test
const fileId = pm.response.json().data.fileId;
pm.environment.set('file_id', fileId);

// Next request uses {{file_id}}
```

### Assertions

Add custom assertions in Tests:
```javascript
pm.test('File size is correct', function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data.size).to.equal(1024000);
});
```

## Best Practices

1. **Always start with Health Check** - Ensure server is running
2. **Login before file operations** - Get fresh token
3. **Use descriptive file names** - Easy to identify in tests
4. **Clean up after tests** - Delete test files
5. **Check console logs** - Troubleshoot issues
6. **Run collection periodically** - Catch regressions early
7. **Document custom workflows** - Help team members

## Integration with CI/CD

Run collection in CI/CD using Newman:

```bash
# Install Newman
npm install -g newman

# Run collection
newman run postman-collection.json \
  --environment production.postman_environment.json \
  --reporters cli,json

# With custom variables
newman run postman-collection.json \
  --env-var "base_url=https://api.production.com"
```
