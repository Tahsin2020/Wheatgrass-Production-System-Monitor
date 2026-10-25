# Stage 1: Build the application
FROM node:18 AS build-stage

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
# Using npm ci for faster, more reliable builds in production
RUN npm install

# Copy all frontend source code
COPY . .

# Build the Next.js application
RUN npm run build

# Stage 2: Production image
FROM node:18-alpine

WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --production

# Copy built application from build stage
COPY --from=build-stage /app/.next ./.next
COPY --from=build-stage /app/next.config.js ./
COPY --from=build-stage /app/pages ./pages
COPY --from=build-stage /app/components ./components

# Expose frontend port
EXPOSE 3000

# Start Next.js in production mode
CMD ["npm", "start"]
