#!/bin/bash
# Wheatgrass Monitor - Control Script
# Uses Docker Compose for all services

COMPOSE_FILE="docker-compose.PRODUCTION.yml"

case "$1" in
  start)
    echo "Starting Wheatgrass Monitor..."
    docker-compose -f "$COMPOSE_FILE" up -d
    echo ""
    echo "✅ All services started:"
    echo "   - Frontend: http://localhost:3000"
    echo "   - Backend: http://localhost:3001"
    echo "   - Database: localhost:5432"
    echo "   - Keycloak: http://localhost:8080"
    echo ""
    echo "Open http://localhost:3000 in your browser"
    ;;
    
  stop)
    echo "Stopping Wheatgrass Monitor..."
    docker-compose -f "$COMPOSE_FILE" down
    echo "✅ All services stopped"
    ;;
    
  restart)
    echo "Restarting Wheatgrass Monitor..."
    docker-compose -f "$COMPOSE_FILE" restart
    echo "✅ All services restarted"
    ;;
    
  status)
    echo "Checking status..."
    docker-compose -f "$COMPOSE_FILE" ps
    ;;
  
  logs)
    # Show logs for a specific service or all services
    if [ -n "$2" ]; then
      docker-compose -f "$COMPOSE_FILE" logs -f "$2"
    else
      docker-compose -f "$COMPOSE_FILE" logs -f
    fi
    ;;
    
  test)
    echo "Testing backend connection..."
    curl -s http://localhost:3001/api/sensors | python3 -m json.tool
    ;;
    
  *)
    echo "Usage: $0 {start|stop|restart|status|logs [service]|test}"
    echo ""
    echo "Commands:"
    echo "  start    - Start all services (database, backend, frontend, keycloak)"
    echo "  stop     - Stop all services"
    echo "  restart  - Restart all services"
    echo "  status   - Show status of all services"
    echo "  logs     - Show logs (optional: specify service name)"
    echo "  test     - Test backend API connection"
    exit 1
    ;;
esac
