# AI News Aggregator - Terraform Configuration
# Basic infrastructure setup for both LocalStack (development) and AWS (production)

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# AWS Provider Configuration
provider "aws" {
  region = var.aws_region

  # LocalStack configuration for local development
  dynamic "endpoints" {
    for_each = var.use_localstack ? [1] : []
    content {
      s3                = var.localstack_endpoint
      dynamodb          = var.localstack_endpoint
      opensearch        = var.localstack_endpoint
      lambda            = var.localstack_endpoint
      apigateway        = var.localstack_endpoint
      iam               = var.localstack_endpoint
      secretsmanager    = var.localstack_endpoint
      eventbridge       = var.localstack_endpoint
    }
  }

  # Skip certain checks for LocalStack
  skip_credentials_validation = var.use_localstack
  skip_metadata_api_check     = var.use_localstack
  skip_requesting_account_id  = var.use_localstack

  # Use test credentials for LocalStack
  access_key = var.use_localstack ? "test" : var.aws_access_key_id
  secret_key = var.use_localstack ? "test" : var.aws_secret_access_key
}

# Data source for current AWS caller identity
data "aws_caller_identity" "current" {}

# Local values for resource naming
locals {
  environment = var.environment
  app_name    = var.app_name
  
  # Resource naming convention
  name_prefix = "${local.app_name}-${local.environment}"
  
  # Common tags
  common_tags = {
    Environment = local.environment
    Application = local.app_name
    ManagedBy   = "terraform"
  }
}