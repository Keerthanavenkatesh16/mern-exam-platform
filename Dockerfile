# Multi-stage Dockerfile for Secure Digital Assessment Platform
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

RUN npm --prefix backend install --production=false
RUN npm --prefix frontend install --production=false

COPY frontend/ ./frontend/
RUN npm --prefix frontend run build

# Production runner image
FROM node:18-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY package.json ./
COPY backend/package*.json ./backend/
RUN npm --prefix backend install --production=true

COPY backend/ ./backend/
COPY --from=builder /app/frontend/build ./frontend/build

EXPOSE 5000

CMD ["node", "backend/server.js"]
