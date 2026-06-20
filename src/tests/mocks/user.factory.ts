import { faker } from "@faker-js/faker";
import * as crypto from 'crypto';
import db from "../../../db/db";
import { CreateUserData, User } from "../../models/user.model";

export class UserFactory {
  public static mockUser(mockWith: Partial<CreateUserData> = {}): CreateUserData {
    return {
      username: faker.internet.username(),
      password_hash: crypto.createHash('md5').update(faker.internet.password()).digest('hex'),
      ...mockWith,
    }
  };

  public static create(mockWith: Partial<CreateUserData> = {}): User {
    const userData: CreateUserData = Object.fromEntries(
      Object.entries(this.mockUser(mockWith)).map(([key, value]) => ([`$${key}`, value]))
    ) as CreateUserData;

    const result: User | null = db.query<User, Record<string, string>>(`INSERT INTO user
      (username, password_hash)
      VALUES ($username, $password_hash)
      RETURNING *`
    ).get(userData as unknown as Record<string, string>);

    if (!result) {
      throw new Error('Mock User was not created successfully.');
    }

    return result;
  }
}