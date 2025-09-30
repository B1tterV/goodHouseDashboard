# Stage 1: Build
FROM node:20.19.4-alpine AS builder

# Устанавливаем pnpm
RUN npm install -g pnpm

WORKDIR /app

# 1. Копируем все конфигурационные файлы
COPY ./src/package.json ./
COPY ./src/pnpm-lock.yaml ./
COPY ./src/pnpm-workspace.yaml ./

# 2. Устанавливаем ВСЕ зависимости (включая devDependencies для сборки)
RUN pnpm install --frozen-lockfile

# 3. Копируем исходный код
COPY ./src .

# 4. Собираем проект (игнорируем предупреждения о built dependencies)
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