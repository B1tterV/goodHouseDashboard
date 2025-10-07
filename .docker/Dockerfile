# Stage 1: Build
FROM node:20.19.4-alpine AS builder

# Устанавливаем pnpm
RUN npm install -g pnpm

WORKDIR /app

# 1. Копируем все конфигурационные файлы
COPY ./src/package.json ./
COPY ./src/pnpm-lock.yaml ./
COPY ./src/pnpm-workspace.yaml ./

# 2. Устанавливаем ВСЕ зависимости
RUN pnpm install --frozen-lockfile

# 3. Явно устанавливаем tailwindcss и необходимые зависимости
RUN pnpm add -D tailwindcss @tailwindcss/vite @nuxtjs/tailwindcss

# 4. Копируем исходный код
COPY ./src .

# 5. Собираем проект
RUN pnpm build

# Stage 2: Production
FROM node:20.19.4-alpine

WORKDIR /app

# Копируем только необходимые файлы
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./

RUN npm install -g pnpm && \
    pnpm install --prod --frozen-lockfile

EXPOSE 3001

CMD ["node", ".output/server/index.mjs"]