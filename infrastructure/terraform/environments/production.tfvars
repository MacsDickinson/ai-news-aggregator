# Production Environment Configuration

environment = "production"
app_name    = "ai-news-aggregator"
aws_region  = "us-east-1"

# Use real AWS for production
use_localstack = false

# Production-specific settings
dynamodb_table_prefix         = "ai-news-aggregator-prod"
enable_point_in_time_recovery = true
enable_deletion_protection    = true