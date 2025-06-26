const { register, login } = require("../controllers/userController");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

jest.mock("../models/userModel");

describe("Auth Controller basic tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should register a new user successfully", async () => {
      User.findOne.mockResolvedValue(null);
      User.prototype.save = jest.fn().mockResolvedValue(true);
      jest.spyOn(bcrypt, "hash").mockResolvedValue("hashedPassword123");

      const req = { body: { email: "newuser@test.com", password: "123456" } };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      await register(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: "newuser@test.com" });
      expect(bcrypt.hash).toHaveBeenCalledWith("123456", 10);
      expect(User.prototype.save).toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(500); // реално статусът е 201, затова тестът ще падне

      expect(res.json).toHaveBeenCalledWith({
        message: "User registered successfully",
      });
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
  });

  describe("login", () => {
    it("should login successfully with correct email and password", async () => {
      const mockUser = {
        _id: "user123",
        email: "user@test.com",
        password: "hashedPassword123",
      };

      User.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, "compare").mockResolvedValue(true);
      jest.spyOn(jwt, "sign").mockReturnValue("token123");

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
      jest.spyOn(bcrypt, "compare").mockResolvedValue(false);

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
  });
});
