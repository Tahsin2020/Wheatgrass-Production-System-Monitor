# Docker Setup for Wheatgrass Monitor

## Overview

The application is containerized using Docker Compose with three main services:
- **PostgreSQL Database** (port 5432)
- **Backend API** (port 3001)
- **Frontend Web App** (port 3000)

## Files

### Backend/Dockerfile
Node.js 18 container for the backend API. Installs dependencies, copies source code, and runs `server.js` on port 3001.

### Frontend/Dockerfile
Multi-stage build for Next.js frontend:
- **Stage 1**: Builds the Next.js application with all dev dependencies
- **Stage 2**: Creates optimized production image with only runtime dependencies and built files

Uses Node.js 18 Alpine for a smaller final image size.

### docker-compose.PRODUCTION.yml
Orchestrates all three services with:
- PostgreSQL 15 Alpine with persistent volume storage
- Backend with environment file configuration and database connection
- Frontend with dependency on backend service
- Automatic restart policies and proper service dependencies

### Backend/.env.example
Template for environment variables. Copy this to `Backend/.env` and configure with your actual values including Home Assistant IP/URL, tokens, and database credentials.

**Note**: When running locally (not in Docker), you may need to use `localhost` instead of `database` for `DB_HOST`.

## Useful Commands

### Start the application
```bash
docker compose -f docker-compose.PRODUCTION.yml up -d
```

### Stop the application
```bash
docker compose -f docker-compose.PRODUCTION.yml down
```

### View logs (all services)
```bash
docker compose -f docker-compose.PRODUCTION.yml logs -f
```

### View logs (specific service)
```bash
docker compose -f docker-compose.PRODUCTION.yml logs -f backend
docker compose -f docker-compose.PRODUCTION.yml logs -f frontend
docker compose -f docker-compose.PRODUCTION.yml logs -f database
```

### Check container status
```bash
docker compose -f docker-compose.PRODUCTION.yml ps
```

### Restart services
```bash
docker compose -f docker-compose.PRODUCTION.yml restart
```

### Rebuild images after code changes
```bash
docker compose -f docker-compose.PRODUCTION.yml build
docker compose -f docker-compose.PRODUCTION.yml up -d
```

### Stop and remove everything (including volumes)
```bash
docker compose -f docker-compose.PRODUCTION.yml down -v
```
⚠️ **Warning**: This deletes all database data

### Execute commands inside a container
```bash
docker compose -f docker-compose.PRODUCTION.yml exec backend sh
docker compose -f docker-compose.PRODUCTION.yml exec frontend sh
docker compose -f docker-compose.PRODUCTION.yml exec database psql -U postgres -d wheatgrass_monitor
```

## Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Database**: localhost:5432

## Deployment

To push images to Docker Hub:
1. Update image names in `docker-compose.PRODUCTION.yml` with your Docker Hub username
2. Build images: `docker compose -f docker-compose.PRODUCTION.yml build`
3. Push images: `docker compose -f docker-compose.PRODUCTION.yml push`
