# Development Environment Configuration

environment = "development"
app_name    = "ai-news-aggregator"
aws_region  = "us-east-1"

# Use LocalStack for local development
use_localstack      = true
localstack_endpoint = "http://localhost:4566"

# Development-specific settings
dynamodb_table_prefix          = "ai-news-aggregator-dev"
enable_point_in_time_recovery  = false
enable_deletion_protection     = false