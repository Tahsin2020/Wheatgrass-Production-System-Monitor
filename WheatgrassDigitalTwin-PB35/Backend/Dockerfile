# Backend Dockerfile
FROM node:18

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all backend source code
COPY . .

# Expose backend port
EXPOSE 3001

# Start the application
CMD ["node", "server.js"]
