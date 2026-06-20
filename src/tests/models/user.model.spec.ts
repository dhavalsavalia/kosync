import { describe, expect, it } from "bun:test";
import { NotFoundError } from "elysia";
import db from "../../../db/db";
import { AuthenticationData, CreateUserData, UnauthorizedError, User } from "../../models/user.model";
import { UserFactory } from "../mocks/user.factory";

describe('UserModel', () => {
  describe('#getById', () => {
    it('should return the user with the matching id', () => {
      const mockUser = UserFactory.create();

      const user = User.getById(mockUser.id);

      expect(user).toEqual({
        id: mockUser.id,
        username: mockUser.username,
        password_hash: mockUser.password_hash,
      });
    });

    it('should throw NotFoundError if no user matches the given id', () => {
      expect(() => User.getById(-1)).toThrow(new NotFoundError('User does not exist'));
    });

    it('should throw NotFoundError if user was deleted', () => {
      const mockUser = UserFactory.create();
      User.deleteById(mockUser.id);

      expect(() => User.getById(mockUser.id)).toThrow(new NotFoundError('User does not exist'));
    });
  });

  describe('#getByUsername', () => {
    it('should return the user with the matching username', () => {
      const mockUser = UserFactory.create();

      const user = User.getByUsername(mockUser.username);

      expect(user).toEqual({
        id: mockUser.id,
        username: mockUser.username,
        password_hash: mockUser.password_hash,
      });
    });

    it('should throw NotFoundError if no user matches the given username', () => {
      expect(() => User.getByUsername('nonexistent-username')).toThrow(new NotFoundError('User does not exist'));
    });

    it('should throw NotFoundError if user was deleted', () => {
      const mockUser = UserFactory.create();
      User.deleteById(mockUser.id);

      expect(() => User.getByUsername(mockUser.username)).toThrow(new NotFoundError('User does not exist'));
    });
  });

  describe('#deleteById', () => {
    it('should delete the user\'s record whose id matches the given id', () => {
      const mockUser: User = UserFactory.create();

      User.deleteById(mockUser.id);

      const userRecord: User | null = db.query<User, number>('SELECT * FROM user WHERE id = ?')
        .get(mockUser.id);

      expect(userRecord).toBeNull();
    });

    it('should return an error if no user\'s records match the given id of user to be deleted', () => {
      expect(() => User.deleteById(-1)).toThrow(new NotFoundError('User does not exist'));
    });
  });

  describe('#create', () => {
    it('should create a new user record', () => {
      const mockUserData: CreateUserData = UserFactory.mockUser();

      const userId: number = User.create(mockUserData) as number;

      const userRecord: User = db.query<User, number>('SELECT * FROM user WHERE id = ?')
        .get(userId) as User;

      expect(userRecord).toEqual({
        id: expect.anything() as any,
        username: mockUserData.username,
        password_hash: mockUserData.password_hash,
      });
    });

    it('should return the id of the created user', () => {
      const mockUserData: CreateUserData = UserFactory.mockUser();

      const userId: number | null = User.create(mockUserData);

      expect(userId).toBeGreaterThan(0);
    });

    it('should throw UserAlreadyExistsError when creating a user with an existing username', () => {
      const mockUserData: CreateUserData = UserFactory.mockUser();
      User.create(mockUserData);

      expect(() => User.create(mockUserData)).toThrow(new Error('Username is already taken.'));
    });

    it('should create multiple users with different usernames', () => {
      const userData1: CreateUserData = UserFactory.mockUser();
      const userData2: CreateUserData = UserFactory.mockUser();

      const userId1: number = User.create(userData1) as number;
      const userId2: number = User.create(userData2) as number;

      expect(userId1).not.toBe(userId2);

      const user1 = db.query<User, number>('SELECT * FROM user WHERE id = ?').get(userId1) as User;
      const user2 = db.query<User, number>('SELECT * FROM user WHERE id = ?').get(userId2) as User;

      expect(user1.username).toBe(userData1.username);
      expect(user2.username).toBe(userData2.username);
    });
  });

  describe('#authenticate', () => {
    it('should not throw an error when credentials are valid', () => {
      const mockUserData: CreateUserData = UserFactory.mockUser();
      const userId = User.create(mockUserData) as number;

      const authData: AuthenticationData = {
        username: mockUserData.username,
        password_hash: mockUserData.password_hash,
      };

      expect(() => User.authenticate(authData)).not.toThrow();
    });

    it('should throw UnauthorizedError when password does not match', () => {
      const mockUserData: CreateUserData = UserFactory.mockUser();
      const userId = User.create(mockUserData) as number;

      const authData: AuthenticationData = {
        username: mockUserData.username,
        password_hash: 'wrong-password-hash',
      };

      expect(() => User.authenticate(authData)).toThrow(new UnauthorizedError("username/password don't match"));
    });

    it('should throw UnauthorizedError when username does not exist', () => {
      const authData: AuthenticationData = {
        username: 'nonexistent-username',
        password_hash: 'some-password',
      };

      expect(() => User.authenticate(authData)).toThrow(new UnauthorizedError("username/password don't match"));
    });

    it('should work with case-sensitive username matching', () => {
      const mockUserData: CreateUserData = UserFactory.mockUser();
      const userId = User.create(mockUserData) as number;

      const authData: AuthenticationData = {
        username: mockUserData.username.toUpperCase(),
        password_hash: mockUserData.password_hash,
      };

      expect(() => User.authenticate(authData)).toThrow(new UnauthorizedError("username/password don't match"));
    });
  });
});