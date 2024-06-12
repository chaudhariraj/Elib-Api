# Use the official Node.js image from the Docker Hub
FROM node:18-alpine as builder

# Create and change to the app directory
WORKDIR /app

# Copy the package.json and package-lock.json (if available)
COPY package*.json ./

# Install project dependencies available in packect json
RUN npm ci

# Copy the rest of the application code
COPY . .

# Define the command to run the app
RUN npm run build 

#build production image 
FROM node:18-alpine 

WORKDIR /app

COPY package*.json ./

ENV NODE_ENV= production

RUN npm ci
#--omit=dev
    
COPY --from=builder /app/dist ./dist

RUN chown -R node:node /app && chmod -R 755 /app

RUN npm install pm2 -g 

COPY ecosystem.config.js .

USER node 

# Expose the port the app runs on
Expose 5513

CMD ["pm2-runtime", "start", "ecosystem.config.js"]

