# Stage 1: Build the React application
FROM node:20-alpine AS builder

WORKDIR /app

# Устанавливаем git для клонирования репозитория
RUN apk add --no-cache git

# Клонируем репозиторий при сборке (всегда актуальный код)
ARG REPO_URL=https://github.com/Its-My-Work/bedolaga.git
ARG BRANCH=main
RUN git clone --depth 1 --branch ${BRANCH} ${REPO_URL} /tmp/repo

# Копируем только cabinet из клонированного репозитория
RUN cp -r /tmp/repo/cabinet/* . && rm -rf /tmp/repo

# Install dependencies
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Build arguments for environment variables
ARG VITE_API_URL=/api
ARG VITE_TELEGRAM_BOT_USERNAME
ARG VITE_APP_NAME=Cabinet
ARG VITE_APP_LOGO=V

# Set environment variables for build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_TELEGRAM_BOT_USERNAME=$VITE_TELEGRAM_BOT_USERNAME
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_APP_LOGO=$VITE_APP_LOGO

# Build the application
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Копируем обновлённый nginx.conf с динамическим DNS
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1
