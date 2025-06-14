# Use the Node.js 22 Alpine base image for a lean environment
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker's cache.
# This way, `npm install` only runs when dependencies change, not on every code change.
COPY package*.json ./

# Install all dependencies, including 'devDependencies' like nodemon
RUN npm install

# Copy the rest of the application's code. This is a fallback in case
# a volume isn't mounted, but our docker-compose file will mount over this.
COPY . .

# Expose the port. The actual port mapping will happen in docker-compose.
# This line is primarily for documentation.
# Example: EXPOSE 3005

# The default command to run when the container starts.
# We will override this in docker-compose.yml to `npm run dev` for hot-reloading.
CMD ["npm", "start"]