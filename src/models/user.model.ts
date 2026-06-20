import { InternalServerError, NotFoundError } from "elysia";
import db from "../../db/db";

export interface User {
  id: number;
  username: String;
  password_hash: String;
}

export interface CreateUserDB {
  $username: String;
  $password_hash: String;
}

export interface CreateUserData {
  username: String;
  password_hash: String;
}

export interface AuthenticationData {
  username: String;
  password_hash: String;
}

export class UnauthorizedError extends Error {
  status = 401;

  constructor(public message: string) {
    super(message);
  }
}

export class UserAlreadyExistsError extends Error {
  status = 409;

  constructor(public message: string) {
    super(message);
  }
}

export class User {
  public static getById(userId: number): User | never {
    const result: User | null = db
      .query<User, number>("SELECT * FROM user WHERE id = ?")
      .get(userId);
    if (!result) {
      throw new NotFoundError(`User does not exist`);
    }

    return result;
  }

  public static getByUsername(username: String): User | never {
    const result: User | null = db
      .query<User, any>("SELECT * FROM user WHERE username = ?")
      .get(username);
    if (!result) {
      throw new NotFoundError(`User does not exist`);
    }

    return result;
  }

  public static deleteById(userId: number): void | never {
    this.getById(userId);

    const result: User | null = db
      .query<User, number>("DELETE FROM user WHERE id = ? RETURNING *")
      .get(userId);

    if (!result) {
      throw new InternalServerError("User was not deleted successfully.");
    }

    return;
  }

  public static create(createData: CreateUserData): number | null | never {
    let dbUser: User | null = null;
    try {
      dbUser = this.getByUsername(createData.username);
    } catch (error) {
      // User doesn't exist, which is fine for creation
      if (!(error instanceof NotFoundError)) {
        throw error;
      }
    }

    if (dbUser) {
      throw new UserAlreadyExistsError("Username is already taken.")
    }

    const createObj: CreateUserDB = {
      $username: createData.username,
      $password_hash: createData.password_hash,
    };

    const result: User | null = db
      .query<User, Record<string, string>>(
        `INSERT INTO user
      (username, password_hash)
      VALUES ($username, $password_hash)
      RETURNING *`,
      )
      .get(createObj as unknown as Record<string, string>);

    if (!result) {
      throw new InternalServerError("User was not created successfully.");
    }

    return result.id;
  }

  public static authenticate(authenticationData: AuthenticationData): void {
    let dbUser: User;
    try {
      dbUser = this.getByUsername(authenticationData.username);
    } catch (error) {
      throw new UnauthorizedError("username/password don't match");
    }

    if (dbUser.password_hash !== authenticationData.password_hash) {
      throw new UnauthorizedError("username/password don't match");
    }
  }
}
