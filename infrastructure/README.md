# AI News Aggregator - Infrastructure

This directory contains the infrastructure as code (IaC) configuration for the AI News Aggregator project using Terraform.

## Overview

The infrastructure supports both local development using LocalStack and production deployment to AWS. The configuration is designed to be environment-agnostic with different variable files for each environment.

## Prerequisites

- [Terraform](https://terraform.io/downloads.html) >= 1.0
- [AWS CLI](https://aws.amazon.com/cli/) (for production deployments)
- [Docker](https://docker.com/) and [LocalStack](https://localstack.cloud/) (for local development)

## Quick Start

### Local Development with LocalStack

1. **Start LocalStack** (see Docker Compose setup in parent directory):

   ```bash
   docker-compose up localstack
   ```

2. **Initialize Terraform**:

   ```bash
   ./scripts/terraform-init.sh development
   ```

3. **Plan the deployment**:

   ```bash
   ./scripts/terraform-plan.sh development
   ```

4. **Apply the changes**:
   ```bash
   ./scripts/terraform-apply.sh development
   ```

### Production Deployment

1. **Configure AWS credentials**:

   ```bash
   aws configure
   ```

2. **Initialize Terraform**:

   ```bash
   ./scripts/terraform-init.sh production
   ```

3. **Plan the deployment**:

   ```bash
   ./scripts/terraform-plan.sh production
   ```

4. **Apply the changes**:
   ```bash
   ./scripts/terraform-apply.sh production
   ```

## Structure

```
infrastructure/
├── terraform/
│   ├── main.tf                 # Main provider and configuration
│   ├── variables.tf            # Input variables
│   ├── outputs.tf              # Output values
│   ├── s3.tf                   # S3 bucket configuration
│   ├── iam.tf                  # IAM roles and policies
│   ├── terraform.tfvars.example # Example variables file
│   └── environments/
│       ├── development.tfvars  # Development environment
│       └── production.tfvars   # Production environment
└── scripts/
    ├── terraform-init.sh       # Initialize Terraform
    ├── terraform-plan.sh       # Plan changes
    └── terraform-apply.sh      # Apply changes
```

## Current Resources

The basic infrastructure currently includes:

- **S3 Bucket**: For cache and static assets
- **IAM Roles**: For Lambda execution
- **IAM Policies**: Basic permissions for services

## Adding New Resources

As features are implemented, additional resources will be added:

- DynamoDB tables (per feature)
- OpenSearch domain
- Lambda functions
- API Gateway
- EventBridge rules
- Secrets Manager

## Environment Configuration

### Development (LocalStack)

- Uses LocalStack endpoints
- Test credentials
- No resource protection
- Simplified configuration

### Production (AWS)

- Real AWS endpoints
- Proper AWS credentials required
- Resource protection enabled
- Full security configuration

## Commands

### Manual Terraform Commands

If you prefer to use Terraform directly:

```bash
cd terraform

# Initialize
terraform init

# Plan for development
terraform plan -var-file=environments/development.tfvars

# Apply for development
terraform apply -var-file=environments/development.tfvars

# Destroy (be careful!)
terraform destroy -var-file=environments/development.tfvars
```

### Environment Variables

The Terraform configuration uses the following environment variables:

- `AWS_REGION`: AWS region (default: us-east-1)
- `AWS_ACCESS_KEY_ID`: AWS access key (not needed for LocalStack)
- `AWS_SECRET_ACCESS_KEY`: AWS secret key (not needed for LocalStack)

## Troubleshooting

### LocalStack Issues

1. **LocalStack not running**:

   ```bash
   docker-compose up localstack
   ```

2. **Permission errors**:
   - Make sure scripts are executable: `chmod +x scripts/*.sh`

3. **Terraform state issues**:
   - Delete `.terraform` directory and re-run `terraform init`

### AWS Issues

1. **Authentication errors**:
   - Verify AWS credentials: `aws sts get-caller-identity`
   - Configure AWS CLI: `aws configure`

2. **Permission errors**:
   - Ensure IAM user/role has necessary permissions
   - Check CloudTrail logs for detailed error messages

## Security Notes

- Never commit `terraform.tfvars` files with real credentials
- Use IAM roles and temporary credentials when possible
- Enable CloudTrail and AWS Config for audit logging
- Review and approve all Terraform plans before applying
