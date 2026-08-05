# --- Base Stage (Shared dependencies) ---
FROM node:26-alpine AS base

WORKDIR /app

# --- Development Stage (For hot-reloading) ---
FROM base AS development
ENV NODE_ENV=development
COPY shared/package*.json ./shared/
COPY server/package*.json ./server/

WORKDIR /app/shared
RUN ["npm", "install"]

WORKDIR /app/server
RUN ["npm", "install"]

WORKDIR /app
COPY server ./server
COPY shared ./shared

WORKDIR /app/server
CMD ["npm", "run", "dev"]

# --- Build Stage (Compile TS to JS) ---
FROM base AS build

COPY server/package*.json ./server/
COPY shared/package*.json ./shared/

WORKDIR /app/shared
RUN npm i

WORKDIR /app/server
RUN npm i

WORKDIR /app
COPY server ./server
COPY shared ./shared

WORKDIR /app/server
RUN npm run build

# --- Production Stage (Tiny, fast runtime) ---
FROM node:26-alpine AS production

WORKDIR /app/server
ENV NODE_ENV=production
COPY server/package*.json ./
RUN npm i --omit=dev

WORKDIR /app/shared
COPY shared/package*.json ./
RUN npm i --omit=dev

WORKDIR /app/server
COPY --from=build /app/server/dist ./dist
EXPOSE 3000
CMD ["node", "dist/server/src/server.js"]
