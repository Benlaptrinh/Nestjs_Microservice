FROM node:20-alpine AS builder

ARG APP_NAME
WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

RUN npm ci

COPY apps ./apps
COPY libs ./libs

RUN npm run build ${APP_NAME}

FROM node:20-alpine

ARG APP_NAME
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

ENV APP_NAME=${APP_NAME}

EXPOSE 3000

CMD node dist/apps/${APP_NAME}/main.js
