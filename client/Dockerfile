FROM node:26-bookworm-slim AS builder

WORKDIR /app

COPY package*.json ./
COPY client/package*.json ./client/
COPY shared/package*.json ./shared/

RUN ["npm", "ci"]

COPY client ./client
COPY shared ./shared

RUN ["npm", "run", "build", "--workspace", "client"]


FROM nginx:1.31.3-alpine AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/client/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]