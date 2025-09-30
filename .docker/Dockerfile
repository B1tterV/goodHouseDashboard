# Stage 1: Build
FROM node:20.19.4-alpine AS builder

# Устанавливаем pnpm
RUN npm install -g pnpm

WORKDIR /app

# 1. Копируем только файлы зависимостей
COPY package.json pnpm-lock.yaml ./

# 2. Устанавливаем ВСЕ зависимости через pnpm
RUN pnpm install --frozen-lockfile

# 3. Копируем исходный код
COPY . .

# 4. Собираем проект
RUN pnpm build

# Stage 2: Production
FROM node:20.19.4-alpine

WORKDIR /app

# Копируем только необходимые файлы
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./

# Устанавливаем pnpm и production-зависимости
RUN npm install -g pnpm && \
    pnpm install --prod --frozen-lockfile

EXPOSE 3001

CMD ["node", ".output/server/index.mjs"]