# Build stage
FROM node:18-alpine3.18 AS builder

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install ALL dependencies including devDependencies
RUN npm install

# Copy source code
COPY . .

# Create logs directory
RUN mkdir -p src/logs

# Production stage
FROM node:18-alpine3.18

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy built app from builder stage
COPY --from=builder /usr/src/app/src ./src
COPY --from=builder /usr/src/app/src/docs ./docs
COPY --from=builder /usr/src/app/test ./test

# Create directories
RUN mkdir -p src/public/img/pets src/public/img/profiles src/public/documents src/logs

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /usr/src/app

# Switch to non-root user
USER nodejs

EXPOSE 8080

CMD ["node", "src/app.js"]