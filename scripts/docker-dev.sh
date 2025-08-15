#!/bin/bash

# Docker development environment management script
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR/.."

# Change to project directory
cd "$PROJECT_DIR"

# Function to show usage
show_usage() {
    echo "🐳 AI News Aggregator - Docker Development Environment"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  up              Start all development services"
    echo "  down            Stop all services"
    echo "  restart         Restart all services"
    echo "  logs [service]  Show logs for all services or specific service"
    echo "  status          Show status of all services"
    echo "  clean           Remove all containers and volumes (destructive!)"
    echo "  localstack      Start only LocalStack"
    echo "  redis           Start only Redis"
    echo "  postgres        Start only PostgreSQL"
    echo "  elasticsearch   Start Elasticsearch + Kibana"
    echo ""
    echo "Examples:"
    echo "  $0 up                    # Start all core services"
    echo "  $0 logs localstack       # Show LocalStack logs"
    echo "  $0 elasticsearch         # Start with Elasticsearch instead of OpenSearch"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        echo "❌ Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Function to wait for service health
wait_for_service() {
    local service=$1
    local max_attempts=30
    local attempt=1
    
    echo "⏳ Waiting for $service to be healthy..."
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose ps "$service" | grep -q "healthy\|Up"; then
            echo "✅ $service is ready!"
            return 0
        fi
        
        echo "  Attempt $attempt/$max_attempts - waiting..."
        sleep 5
        attempt=$((attempt + 1))
    done
    
    echo "❌ $service failed to become healthy within timeout"
    return 1
}

# Main command handling
case "${1:-}" in
    "up")
        echo "🚀 Starting development environment..."
        check_docker
        docker-compose --env-file .env.docker up -d localstack redis postgres
        wait_for_service localstack
        echo "✅ Development environment is ready!"
        echo ""
        echo "Services available:"
        echo "  - LocalStack: http://localhost:4566"
        echo "  - Redis: localhost:6379"
        echo "  - PostgreSQL: localhost:5432"
        ;;
        
    "down")
        echo "🛑 Stopping development environment..."
        docker-compose --env-file .env.docker down
        echo "✅ Development environment stopped"
        ;;
        
    "restart")
        echo "🔄 Restarting development environment..."
        docker-compose --env-file .env.docker down
        docker-compose --env-file .env.docker up -d localstack redis postgres
        wait_for_service localstack
        echo "✅ Development environment restarted!"
        ;;
        
    "logs")
        service="${2:-}"
        if [ -n "$service" ]; then
            echo "📋 Showing logs for $service..."
            docker-compose --env-file .env.docker logs -f "$service"
        else
            echo "📋 Showing logs for all services..."
            docker-compose --env-file .env.docker logs -f
        fi
        ;;
        
    "status")
        echo "📊 Service status:"
        docker-compose --env-file .env.docker ps
        ;;
        
    "clean")
        echo "🧹 Cleaning up development environment..."
        echo "⚠️  This will remove all containers and volumes!"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker-compose --env-file .env.docker down -v --remove-orphans
            docker system prune -f
            echo "✅ Cleanup complete"
        else
            echo "❌ Cleanup cancelled"
        fi
        ;;
        
    "localstack")
        echo "🚀 Starting LocalStack only..."
        check_docker
        docker-compose --env-file .env.docker up -d localstack
        wait_for_service localstack
        echo "✅ LocalStack is ready at http://localhost:4566"
        ;;
        
    "redis")
        echo "🚀 Starting Redis only..."
        check_docker
        docker-compose --env-file .env.docker up -d redis
        echo "✅ Redis is ready at localhost:6379"
        ;;
        
    "postgres")
        echo "🚀 Starting PostgreSQL only..."
        check_docker
        docker-compose --env-file .env.docker up -d postgres
        echo "✅ PostgreSQL is ready at localhost:5432"
        ;;
        
    "elasticsearch")
        echo "🚀 Starting Elasticsearch + Kibana..."
        check_docker
        docker-compose --env-file .env.docker --profile elasticsearch up -d elasticsearch kibana
        echo "✅ Elasticsearch ready at http://localhost:9200"
        echo "✅ Kibana ready at http://localhost:5601"
        ;;
        
    "help"|"-h"|"--help"|"")
        show_usage
        ;;
        
    *)
        echo "❌ Unknown command: $1"
        echo ""
        show_usage
        exit 1
        ;;
esac