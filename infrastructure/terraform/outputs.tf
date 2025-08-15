# Output Values for AI News Aggregator Infrastructure

output "environment" {
  description = "Environment name"
  value       = var.environment
}

output "aws_region" {
  description = "AWS region"
  value       = var.aws_region
}

output "use_localstack" {
  description = "Whether LocalStack is being used"
  value       = var.use_localstack
}

output "s3_bucket_name" {
  description = "S3 bucket name for cache and assets"
  value       = aws_s3_bucket.cache.bucket
}

output "s3_bucket_arn" {
  description = "S3 bucket ARN"
  value       = aws_s3_bucket.cache.arn
}

# Add more outputs as resources are created
# output "dynamodb_table_names" {
#   description = "DynamoDB table names"
#   value = {
#     users = aws_dynamodb_table.users.name
#     # Add other tables as they're created
#   }
# }