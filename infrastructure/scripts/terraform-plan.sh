#!/bin/bash

# Terraform plan script for AI News Aggregator
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TERRAFORM_DIR="$SCRIPT_DIR/../terraform"
ENVIRONMENT="${1:-development}"

echo "📋 Planning Terraform changes for environment: $ENVIRONMENT"

# Change to terraform directory
cd "$TERRAFORM_DIR"

# Check if environment file exists
if [ ! -f "environments/$ENVIRONMENT.tfvars" ]; then
    echo "❌ Environment file not found: environments/$ENVIRONMENT.tfvars"
    echo "Available environments:"
    ls -1 environments/*.tfvars 2>/dev/null | sed 's/.*\///; s/\.tfvars$//' | sed 's/^/  - /' || echo "  (none)"
    exit 1
fi

# Run terraform plan
echo "📋 Running terraform plan..."
terraform plan -var-file="environments/$ENVIRONMENT.tfvars" -out="$ENVIRONMENT.tfplan"

echo "✅ Terraform plan complete for environment: $ENVIRONMENT"
echo "Plan saved to: $ENVIRONMENT.tfplan"
echo ""
echo "To apply the plan, run:"
echo "  terraform apply $ENVIRONMENT.tfplan"