const { register, login } = require("../auth/auth.controller");
const User = require("../auth/auth.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

jest.mock("../auth/auth.model");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("Auth Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("register", () => {
    it("should register a new user successfully", async () => {
      // Mock dependencies
      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashedPassword123");

      const mockSave = jest.fn().mockResolvedValue(true);
      const mockUserInstance = {
        email: "newuser@test.com",
        password: "hashedPassword123",
        save: mockSave,
      };

      User.mockImplementation((data) => {
        expect(data).toEqual({
          email: "newuser@test.com",
          password: "hashedPassword123",
        });
        return mockUserInstance;
      });

      const req = { body: { email: "newuser@test.com", password: "123456" } };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      await register(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: "newuser@test.com" });
      expect(bcrypt.hash).toHaveBeenCalledWith("123456", 10);
      expect(User).toHaveBeenCalledWith({
        email: "newuser@test.com",
        password: "hashedPassword123",
      });
      expect(mockSave).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("should return error if user already exists", async () => {
      User.findOne.mockResolvedValue({ email: "exists@test.com" });

      const req = { body: { email: "exists@test.com", password: "123456" } };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      await register(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: "exists@test.com" });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "The email address already exists",
      });
    });

    it("should handle database errors and return 500", async () => {
      User.findOne.mockRejectedValue(new Error("Database connection failed"));

      const req = { body: { email: "test@test.com", password: "123456" } };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
      expect(console.error).toHaveBeenCalledWith(
        "❌ Registration error:",
        "Database connection failed"
      );
    });

    it("should handle bcrypt errors and return 500", async () => {
      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockRejectedValue(new Error("Bcrypt error"));

      const req = { body: { email: "test@test.com", password: "123456" } };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
      expect(console.error).toHaveBeenCalledWith(
        "❌ Registration error:",
        "Bcrypt error"
      );
    });
  });

  describe("login", () => {
    it("should login successfully with correct email and password", async () => {
      const mockUser = {
        _id: "user123",
        email: "user@test.com",
        password: "hashedPassword123",
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("token123");

      const req = { body: { email: "user@test.com", password: "123456" } };
      const res = {
        json: jest.fn(),
        status: jest.fn(() => res),
      };

      await login(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: "user@test.com" });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "123456",
        "hashedPassword123"
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: "user123" },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      expect(res.json).toHaveBeenCalledWith({
        token: "token123",
        userId: "user123",
        email: "user@test.com",
      });
    });

    it("should return error for wrong email", async () => {
      User.findOne.mockResolvedValue(null);

      const req = { body: { email: "wrong@test.com", password: "123456" } };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      await login(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: "wrong@test.com" });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Wrong email" });
    });

    it("should return error for wrong password", async () => {
      const mockUser = {
        _id: "user123",
        email: "user@test.com",
        password: "hashedPassword123",
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      const req = { body: { email: "user@test.com", password: "wrongpass" } };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      await login(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: "user@test.com" });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "wrongpass",
        "hashedPassword123"
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Wrong password" });
    });

    it("should handle database errors during login and return 500", async () => {
      User.findOne.mockRejectedValue(new Error("Database error"));

      const req = { body: { email: "user@test.com", password: "123456" } };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
      expect(console.error).toHaveBeenCalledWith(
        "❌ Login error:",
        "Database error"
      );
    });

    it("should handle bcrypt compare errors and return 500", async () => {
      const mockUser = {
        _id: "user123",
        email: "user@test.com",
        password: "hashedPassword123",
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockRejectedValue(new Error("Bcrypt compare error"));

      const req = { body: { email: "user@test.com", password: "123456" } };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
      expect(console.error).toHaveBeenCalledWith(
        "❌ Login error:",
        "Bcrypt compare error"
      );
    });

    it("should handle JWT sign errors and return 500", async () => {
      const mockUser = {
        _id: "user123",
        email: "user@test.com",
        password: "hashedPassword123",
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockImplementation(() => {
        throw new Error("JWT error");
      });

      const req = { body: { email: "user@test.com", password: "123456" } };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
      expect(console.error).toHaveBeenCalledWith(
        "❌ Login error:",
        "JWT error"
      );
    });
  });
});
