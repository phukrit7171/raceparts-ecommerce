# Use the Node.js 22 Alpine base image
FROM node:22-alpine

# Set the working directory
WORKDIR /app

# Copy package files and install all dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source code.
# The 'volumes' in docker-compose will mount over this, ensuring our local
# code is always used.
COPY . .

# The SvelteKit/Vite dev server will be started by the command in docker-compose.
# It typically runs on port 5173 by default.
EXPOSE 5173

# Default command if not overridden (though we will override it)
CMD ["npm", "run", "dev"]