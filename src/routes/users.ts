import Elysia, { t } from "elysia";
import { UserController } from "../controllers/user.controller";

export const usersRoutes = new Elysia().group("/users", (app) =>
  app
    .post("/create", ({ body }) => UserController.create(body), {
      body: t.Object({
        username: t.String(),
        password_hash: t.String(),
      }),
    })
    .post("/auth", ({ body }) => UserController.authenticate(body), {
      body: t.Object({
        username: t.String(),
        password_hash: t.String(),
      }),
    })
    .delete("/:id", ({ params: { id } }) => UserController.deleteUserById(id), {
      params: t.Object({ id: t.Numeric() }),
    }),
);
