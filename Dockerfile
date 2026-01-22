# Build stage
FROM node:18-alpine3.18 AS builder

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install ALL dependencies including devDependencies
RUN npm install

# Copy source code
COPY . .

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

# Create directory for uploads
RUN mkdir -p src/public/img

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "src/app.js"]