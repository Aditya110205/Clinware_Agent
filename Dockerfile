# ==============================================================================
# CLINWARE MARKET INTELLIGENCE RESEARCHER - UNIFIED DOCKERFILE
# This single file builds and runs both frontend (React) and backend (Java)
# ==============================================================================

# ------------------------------------------------------------------------------
# STAGE 1: Build Backend (Java Spring Boot)
# ------------------------------------------------------------------------------
FROM maven:3.9-eclipse-temurin-21 AS backend-builder

WORKDIR /build

# Copy backend files
COPY pom.xml .
COPY src ./src

# Build the application (skip tests for faster build)
RUN mvn clean package -DskipTests

# ------------------------------------------------------------------------------
# STAGE 2: Build Frontend (React + Vite)
# ------------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder

WORKDIR /build

# Copy frontend package files
COPY frontend/package.json frontend/package-lock.json* ./

# Install dependencies
RUN npm ci --silent

# Copy frontend source code
COPY frontend/ ./

# Build for production
RUN npm run build

# ------------------------------------------------------------------------------
# STAGE 3: Final Runtime Image
# ------------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine

# Install Nginx and curl for health checks
RUN apk add --no-cache nginx curl

# Create app directory
WORKDIR /app

# Copy backend JAR from builder stage
COPY --from=backend-builder /build/target/*.jar /app/backend.jar

# Copy frontend build files to Nginx directory
COPY --from=frontend-builder /build/dist /usr/share/nginx/html

# Create Nginx configuration directory
RUN mkdir -p /run/nginx && \
    mkdir -p /etc/nginx/http.d

# Configure Nginx
RUN cat > /etc/nginx/http.d/default.conf <<'EOF'
server {
    listen 80;
    server_name localhost;
    
    # Frontend static files
    root /usr/share/nginx/html;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;
    
    # Frontend routes (SPA)
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Proxy API requests to backend
    location /api {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Create startup script
RUN cat > /app/start.sh <<'EOF'
#!/bin/sh

echo "================================================"
echo "Starting Clinware Market Intelligence Researcher"
echo "================================================"

# Start backend in background
echo "Starting Java Backend on port 8080..."
java -Xms256m -Xmx512m -jar /app/backend.jar > /var/log/backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to start
echo "Waiting for backend to initialize..."
for i in $(seq 1 30); do
    if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1 || \
       curl -s http://localhost:8080/health > /dev/null 2>&1 || \
       curl -s http://localhost:8080/api/health > /dev/null 2>&1; then
        echo "✓ Backend is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "⚠ Backend taking longer than expected, but continuing..."
    fi
    sleep 2
done

# Start Nginx in foreground
echo "Starting Nginx on port 80..."
echo "================================================"
echo "✓ Application is ready!"
echo "  Frontend: http://localhost:80"
echo "  Backend:  http://localhost:8080"
echo "================================================"

# Run nginx in foreground
exec nginx -g 'daemon off;'
EOF

# Make startup script executable
RUN chmod +x /app/start.sh

# Create log directory
RUN mkdir -p /var/log && touch /var/log/backend.log

# Expose port 80 (Nginx handles both frontend and backend proxy)
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:80/health || exit 1

# Set labels for metadata
LABEL maintainer="clinware-team"
LABEL version="1.0"
LABEL description="Clinware Market Intelligence Researcher - Full Stack Application"

# Start the application
CMD ["/app/start.sh"]