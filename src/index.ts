import { cors } from "@elysia/cors";
import { openapi } from "@elysia/openapi";
import { Elysia } from "elysia";
import { usersRoutes } from "./routes/users";

const port = Number(process.env.PORT) || 3000;

const app = new Elysia()
  .use(
    cors({
      origin: process.env.CORS_ORIGIN || "*",
    }),
  )
  .get("/health", () => ({ status: "ok" }))
  .use(openapi({
    documentation: {
      info: {
        title: 'KOSync',
        version: '0.1.0',
        description: 'KOReader let\'s you sync your reading progress across devices. Built with Elysia and Bun.'
      },
    },
  }))
  .use(usersRoutes)
  .listen({
    port,
    hostname: "0.0.0.0",
  });

console.log(
  `🚀 Sever is running at ${app.server?.hostname}:${app.server?.port}`,
);

const shutdown = async (signal: string) => {
  console.log(`Received ${signal}, shutting down`);
  await app.stop();
  process.exit(0);
};

// Handle SIGTERM from Docker stop
process.on('SIGTERM', () => void shutdown('SIGTERM'));

process.on('SIGINT', () => void shutdown('SIGINT'));
