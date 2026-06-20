FROM oven/bun

WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile --production

COPY src ./src
COPY db ./db
COPY tsconfig.json ./

RUN chown -R appuser:appgroup /app

USER appuser

ENV NODE_ENV production

EXPOSE 3000

CMD ["bun", "src/index.ts"]