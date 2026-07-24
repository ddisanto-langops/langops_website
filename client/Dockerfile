FROM node:26-bookworm-slim AS builder

WORKDIR /app
COPY client/package*.json ./client/

WORKDIR /app/client
RUN ["npm", "install"]

WORKDIR /app
COPY client ./client
COPY shared ./shared

WORKDIR /app/client
RUN ["npm", "run", "build"]

# ------------- Prod -------------
FROM nginx:1.31.3-alpine AS runner
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/client/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]