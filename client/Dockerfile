FROM node:26-bookworm-slim AS builder
WORKDIR /app
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY server/package*.json ./server/
COPY client/package*.json ./client/
RUN npm ci
COPY . .

RUN npm run build --workspace=shared
RUN npm run build --workspace=client

# ------------- Prod -------------
FROM nginx:1.31.3-alpine AS runner
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/client/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]