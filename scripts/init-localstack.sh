#!/bin/bash

# Initialize LocalStack with required AWS services
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR/.."

echo "🔧 Initializing LocalStack services..."

# Set LocalStack endpoint
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1
LOCALSTACK_ENDPOINT=http://localhost:4566

# Function to check if LocalStack is ready
check_localstack() {
    local max_attempts=30
    local attempt=1
    
    echo "⏳ Waiting for LocalStack to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$LOCALSTACK_ENDPOINT/_localstack/health" > /dev/null 2>&1; then
            echo "✅ LocalStack is ready!"
            return 0
        fi
        
        echo "  Attempt $attempt/$max_attempts - waiting..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "❌ LocalStack failed to start within timeout"
    return 1
}

# Check if LocalStack is running
if ! check_localstack; then
    echo "💡 Starting LocalStack first..."
    cd "$PROJECT_DIR"
    ./scripts/docker-dev.sh localstack
    check_localstack
fi

echo "🏗️  Creating S3 buckets..."
aws --endpoint-url=$LOCALSTACK_ENDPOINT s3 mb s3://ai-news-aggregator-development-cache || echo "Bucket may already exist"

echo "📊 Creating initial DynamoDB tables..."
# This will be expanded as we add more tables per feature

echo "🔍 Setting up OpenSearch domain..."
# This will be added when we implement search functionality

echo "✅ LocalStack initialization complete!"
echo ""
echo "Available services:"
echo "  - S3: aws --endpoint-url=$LOCALSTACK_ENDPOINT s3 ls"
echo "  - DynamoDB: aws --endpoint-url=$LOCALSTACK_ENDPOINT dynamodb list-tables"
echo "  - LocalStack Web UI: http://localhost:4566"
echo ""
echo "To use AWS CLI with LocalStack:"
echo "  export AWS_ACCESS_KEY_ID=test"
echo "  export AWS_SECRET_ACCESS_KEY=test"
echo "  aws --endpoint-url=$LOCALSTACK_ENDPOINT <service> <command>"