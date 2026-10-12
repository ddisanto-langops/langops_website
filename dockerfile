FROM node:22-alpine

WORKDIR /app

# Copy package management files first to leverage Docker layer caching
COPY package.json package-lock.json* ./

# Install dependencies (including devDependencies needed for compilation)
RUN npm install

# Copy the rest of the application files
COPY . .

# Next.js dev server runs on port 3000 by default
EXPOSE 3000

# Start the Next.js development server
CMD ["npm", "run", "dev"]
