# =============================================================================
# AADSec Demo Terraform — Intentionally Insecure Infrastructure
# ⚠️ DO NOT APPLY TO ANY REAL CLOUD ENVIRONMENT — DEMO ONLY
# =============================================================================

terraform {
  required_version = ">= 1.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region                      = "us-east-1"
  skip_credentials_validation = true
  skip_requesting_account_id  = true
  access_key                  = "MOCK_KEY_FOR_LOCAL_TF_VALIDATION_ONLY"
  secret_key                  = "MOCK_SECRET_FOR_LOCAL_TF_VALIDATION_ONLY"
}

# ⚠️ VULNERABILITY: Overly Permissive Security Group
# - Ingress open to entire world (0.0.0.0/0) on ALL ports (Checkov: CKV_AWS_260)
# - Direct unrestricted SSH ingress from any IP (Checkov: CKV_AWS_24)
resource "aws_security_group" "vulnerable_web_sg" {
  name        = "demo-vulnerable-sg"
  description = "Intentionally open security group for AADSec IaC demonstration"
  vpc_id      = "vpc-12345678"

  # Bad practice: Open to the entire internet on all ports
  ingress {
    description = "Allow all inbound traffic from everywhere"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Bad practice: Unrestricted SSH access
  ingress {
    description = "Public SSH port"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ⚠️ VULNERABILITY: Unencrypted EBS Volume (Checkov: CKV_AWS_3)
resource "aws_ebs_volume" "unencrypted_database_disk" {
  availability_zone = "us-east-1a"
  size              = 40
  encrypted         = false # Flagged by Checkov and Trivy

  tags = {
    Name        = "demo-customer-data-disk"
    Environment = "demo-vulnerable"
  }
}
