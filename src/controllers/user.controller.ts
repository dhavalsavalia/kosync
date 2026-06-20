
import { AuthenticationData, CreateUserData, User } from '../models/user.model';

export class UserController {
  public static deleteUserById(userId: number): void {
    return User.deleteById(userId);
  }

  public static authenticate(body: AuthenticationData): void {
    return User.authenticate(body);
  }

  public static create(body: CreateUserData): number | null | never {
    return User.create(body);
  }
}
