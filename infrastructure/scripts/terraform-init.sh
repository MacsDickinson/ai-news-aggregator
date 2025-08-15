#!/bin/bash

# Terraform initialization script for AI News Aggregator
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TERRAFORM_DIR="$SCRIPT_DIR/../terraform"
ENVIRONMENT="${1:-development}"

echo "🚀 Initializing Terraform for environment: $ENVIRONMENT"

# Change to terraform directory
cd "$TERRAFORM_DIR"

# Initialize Terraform
echo "📦 Running terraform init..."
terraform init

# Validate configuration
echo "✅ Validating Terraform configuration..."
terraform validate

# Format Terraform files
echo "🎨 Formatting Terraform files..."
terraform fmt -recursive

echo "✅ Terraform initialization complete for environment: $ENVIRONMENT"
echo ""
echo "Next steps:"
echo "  1. Copy terraform.tfvars.example to terraform.tfvars and customize"
echo "  2. Run: terraform plan -var-file=environments/$ENVIRONMENT.tfvars"
echo "  3. Run: terraform apply -var-file=environments/$ENVIRONMENT.tfvars"