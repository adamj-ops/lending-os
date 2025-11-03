# AWS S3 Setup Guide for Lending OS

This guide explains how to configure AWS S3 for file uploads in Lending OS.

---

## Prerequisites

- AWS account with IAM access
- AWS CLI installed (optional but recommended)

---

## Step 1: Create S3 Bucket

### Via AWS Console

1. Navigate to [S3 Console](https://console.aws.amazon.com/s3/)
2. Click **Create bucket**
3. Configure bucket:
   - **Bucket name**: `lending-os-documents` (must be globally unique)
   - **Region**: `us-east-1` (or your preferred region)
   - **Block Public Access**: Keep enabled (we use presigned URLs)
   - **Versioning**: Optional (recommended for document history)
   - **Encryption**: Enable default encryption
4. Click **Create bucket**

### Via AWS CLI

```bash
aws s3 mb s3://lending-os-documents --region us-east-1
```

---

## Step 2: Configure CORS

Browser uploads require CORS configuration.

### Via AWS Console

1. Go to your bucket → **Permissions** tab
2. Scroll to **Cross-origin resource sharing (CORS)**
3. Click **Edit**
4. Paste this configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "POST", "DELETE", "GET"],
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://yourdomain.com"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

5. Click **Save changes**

### Via AWS CLI

```bash
aws s3api put-bucket-cors --bucket lending-os-documents --cors-configuration file://cors.json
```

Where `cors.json` contains the JSON above.

---

## Step 3: Create IAM User for Application

### Create IAM User

1. Navigate to [IAM Console](https://console.aws.amazon.com/iam/)
2. Click **Users** → **Create user**
3. User name: `lending-os-uploader`
4. **Access type**: Programmatic access
5. Click **Next**

### Attach Permissions

Create a custom policy with minimal permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::lending-os-documents/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::lending-os-documents"
    }
  ]
}
```

### Get Credentials

After creating the user:
1. Copy the **Access Key ID**
2. Copy the **Secret Access Key** (shown only once!)
3. Store these securely

---

## Step 4: Configure Environment Variables

Add these to your `.env.local` file:

```bash
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=lending-os-documents
```

**⚠️ Important**: Never commit `.env.local` to git!

---

## Step 5: Verify Configuration

### Test Presigned URL Generation

Start the dev server and test:

```bash
curl -X POST http://localhost:3000/api/v1/upload/presigned-url \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "test.pdf",
    "fileType": "application/pdf",
    "folder": "loan-documents"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://lending-os-documents.s3.us-east-1.amazonaws.com/...",
    "fileKey": "loan-documents/1729872000000-test.pdf",
    "publicUrl": "https://lending-os-documents.s3.us-east-1.amazonaws.com/..."
  }
}
```

### Test Upload via UI

1. Start dev server: `npm run dev`
2. Navigate to Loans page
3. Click "New Loan" to open wizard
4. Progress to Documents step (Step 6)
5. Upload a test file
6. Verify upload completes successfully
7. Check S3 bucket for uploaded file

---

## Folder Structure in S3

Files are organized by type:

```
lending-os-documents/
├── loan-documents/
│   ├── 1729872000000-application.pdf
│   ├── 1729872001000-appraisal.pdf
│   └── ...
├── uploads/
│   └── (default folder for misc uploads)
└── (additional folders as needed)
```

Timestamp prefixes prevent filename collisions.

---

## Security Best Practices

### IAM User Security
- ✅ Use minimal permissions (only s3:PutObject, GetObject, DeleteObject)
- ✅ Scope permissions to specific bucket
- ✅ Rotate access keys periodically (every 90 days)
- ✅ Never commit credentials to version control
- ✅ Use different IAM users for dev/staging/production

### S3 Bucket Security
- ✅ Keep Block Public Access enabled
- ✅ Use presigned URLs for temporary access
- ✅ Enable versioning for document history
- ✅ Configure lifecycle rules for old file cleanup
- ✅ Enable server-side encryption
- ✅ Set up CloudTrail logging for audit

### Application Security
- ✅ Validate file types on client and server
- ✅ Enforce file size limits
- ✅ Validate user has permission to upload
- ✅ Associate files with entities in database
- ✅ Clean up orphaned files periodically

---

## Troubleshooting

### "Access Denied" Errors

**Cause**: IAM permissions insufficient  
**Fix**: Verify IAM policy includes required actions on correct resource

### CORS Errors in Browser

**Cause**: CORS not configured or origin mismatch  
**Fix**: Update CORS configuration with your domain

### "Bucket Not Found" Errors

**Cause**: Bucket name or region mismatch  
**Fix**: Verify `AWS_S3_BUCKET_NAME` and `AWS_REGION` in .env.local

### Upload Fails Silently

**Cause**: Invalid presigned URL or expired  
**Fix**: Check URL expiration (default 1 hour), verify S3 client config

---

## Production Considerations

### For Production Deployment

1. **Separate Buckets**: Use different buckets for dev/staging/prod
2. **CDN**: Consider CloudFront for faster downloads
3. **Backup**: Enable versioning and cross-region replication
4. **Monitoring**: Set up CloudWatch alarms for bucket metrics
5. **Cost**: Monitor storage costs and set up lifecycle policies

### Cost Optimization

- Set lifecycle rules to archive old documents to Glacier
- Delete incomplete multipart uploads after 7 days
- Use S3 Intelligent-Tiering for automatic cost optimization

### Recommended Lifecycle Rule

```json
{
  "Rules": [
    {
      "Id": "ArchiveOldDocuments",
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 90,
          "StorageClass": "STANDARD_IA"
        },
        {
          "Days": 365,
          "StorageClass": "GLACIER"
        }
      ]
    }
  ]
}
```

---

## Additional Resources

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [Presigned URLs Guide](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html)
- [CORS Configuration](https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors.html)
- [IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)

---

**Setup complete! Your Lending OS is ready for document uploads.**

