# =============================================================================
# Insecure S3 Bucket Definitions
# ⚠️ VULNERABILITIES DEMONSTRATED:
# 1. Public Read ACL (Checkov: CKV_AWS_20)
# 2. Disabled S3 Public Access Block (Checkov: CKV_AWS_53, 54, 55, 56)
# 3. Missing Server-Side Encryption (Checkov: CKV_AWS_19)
# 4. Disabled Versioning (Checkov: CKV_AWS_21)
# 5. Missing Access Logging (Checkov: CKV_AWS_18)
# =============================================================================

resource "aws_s3_bucket" "public_demo_bucket" {
  bucket = "aadsec-demo-customer-uploads-public-bucket"

  # Bad practice: Public read ACL
  acl = "public-read"

  tags = {
    Name        = "aadsec-demo-public-bucket"
    Environment = "demo"
    Sensitivity = "high"
  }
}

# ⚠️ Bad practice: Explicitly disabling public access controls
resource "aws_s3_bucket_public_access_block" "disabled_protection" {
  bucket = aws_s3_bucket.public_demo_bucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}
