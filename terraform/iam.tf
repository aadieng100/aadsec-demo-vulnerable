# =============================================================================
# Insecure IAM Policy Configuration
# ⚠️ VULNERABILITIES DEMONSTRATED:
# 1. Wildcard Action ("*") and Wildcard Resource ("*") (Checkov: CKV_AWS_1, CKV_AWS_62)
# 2. Overly permissive role assumption without condition
# =============================================================================

resource "aws_iam_role" "app_demo_role" {
  name = "aadsec-demo-app-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

# ⚠️ VULNERABILITY: Full administrative wildcard policy
resource "aws_iam_policy" "overly_permissive_admin_policy" {
  name        = "aadsec-demo-excessive-permissions"
  description = "Excessive wildcard policy flagged by Checkov and Trivy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = "*" # Bad practice: Full wildcard action
        Resource = "*" # Bad practice: Full wildcard resource
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "demo_attachment" {
  role       = aws_iam_role.app_demo_role.name
  policy_arn = aws_iam_policy.overly_permissive_admin_policy.arn
}
