# --- Base Stage ---
FROM node:26-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY client/package*.json ./client/
COPY server/package*.json ./server/

RUN npm ci --include=dev

# --- Development Stage ---
FROM base AS development
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
WORKDIR /app
CMD ["npm", "run", "dev", "--workspace=server"]

# --- Build Stage ---
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build --workspace=shared
RUN npm run build --workspace=server


FROM node:26-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY shared/package*.json ./shared/
COPY server/package*.json ./server/
RUN npm ci --omit=dev

COPY --from=build /app/shared/dist ./shared/dist
COPY --from=build /app/server/dist ./server/dist

WORKDIR /app/server
EXPOSE 3200
CMD ["node", "dist/server.js"]