#!/bin/bash

# Terraform apply script for AI News Aggregator
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TERRAFORM_DIR="$SCRIPT_DIR/../terraform"
ENVIRONMENT="${1:-development}"

echo "🚀 Applying Terraform changes for environment: $ENVIRONMENT"

# Change to terraform directory
cd "$TERRAFORM_DIR"

# Check if plan file exists
if [ -f "$ENVIRONMENT.tfplan" ]; then
    echo "📋 Applying existing plan file: $ENVIRONMENT.tfplan"
    terraform apply "$ENVIRONMENT.tfplan"
    # Clean up plan file after successful apply
    rm "$ENVIRONMENT.tfplan"
else
    echo "📋 No plan file found, running plan and apply..."
    if [ ! -f "environments/$ENVIRONMENT.tfvars" ]; then
        echo "❌ Environment file not found: environments/$ENVIRONMENT.tfvars"
        exit 1
    fi
    terraform apply -var-file="environments/$ENVIRONMENT.tfvars" -auto-approve
fi

echo "✅ Terraform apply complete for environment: $ENVIRONMENT"
echo ""
echo "Infrastructure is now deployed! 🎉"