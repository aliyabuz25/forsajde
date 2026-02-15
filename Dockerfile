# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application files
COPY server.js ./
COPY map.json ./
COPY editor-logic.js ./
COPY editor-styles.css ./
COPY editor.html ./
COPY acp.html ./

# Create uploads directory
RUN mkdir -p /app/uploads

# Expose port
EXPOSE 3000

# Set environment variables
ENV HOST=0.0.0.0
ENV PORT=3000

# Start the application
CMD ["node", "server.js"]
