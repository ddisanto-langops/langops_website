# --- Base Stage (Shared dependencies) ---
FROM node:26-alpine AS base
WORKDIR /app
COPY package*.json ./

# --- Development Stage (For hot-reloading) ---
FROM base AS development
COPY package*.json ./
COPY server/package*.json ./server/
COPY shared/package*.json ./shared/
RUN npm install
COPY server ./server
COPY shared ./shared
CMD ["npm", "run", "dev", "--workspace", "server"]

# --- Build Stage (Compile TS to JS) ---
FROM base AS build
RUN npm ci
COPY . . 
RUN npm run build

# --- Production Stage (Tiny, fast runtime) ---
FROM node:26-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.js"]
