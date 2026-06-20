import { faker } from "@faker-js/faker";
import * as crypto from "crypto";
import { CreateUserDB } from "../../src/models/user.model";
import db from "../db";

const FAKE_USERS_AMOUNT: number = 1;

/**
 * Populate the user db table with mock users.
 */
const mockUsers = () => {
  const mockUserFn = (): CreateUserDB => ({
    $username: faker.internet.username(),
    $password_hash: crypto
      .createHash("md5")
      .update(faker.internet.password())
      .digest("hex"),
  });

  const mockUsersToCreate: CreateUserDB[] = new Array(FAKE_USERS_AMOUNT)
    .fill(null)
    .map(mockUserFn);

  const query = db.prepare(
    `INSERT INTO user (username, password_hash) VALUES ($username, $password_hash)`,
  );

  const transactionFn: CallableFunction = db.transaction(
    (usersToInsert: any[]) => {
      usersToInsert.forEach((userToInsert: any) => query.run(userToInsert));

      return usersToInsert.length;
    },
  );

  const insertedRecords: number = transactionFn(mockUsersToCreate);

  console.log(
    `✅ Database successfully seeded with ${insertedRecords} fake users.`,
  );
};

// Clear table beforehand
db.query("DELETE FROM user").run();

// Seed the user table
mockUsers();

process.exit();
