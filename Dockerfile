# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache postgresql-client

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy schema for Prisma client generation
COPY prisma ./prisma/

# Generate Prisma client (needs DATABASE_URL as build arg)
ARG DATABASE_URL
RUN npx prisma generate

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
