const { getPortfolio } = require("../controllers/portfolioController");
const Portfolio = require("../models/portfolioModel");

jest.mock("../models/portfolioModel");

describe("Portfolio Controller - getPortfolio", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should create and return a new portfolio if none found", async () => {
    // findOne връща null -> няма портфолио
    Portfolio.findOne.mockResolvedValue(null);

    // Мока на конструктора на Portfolio с метода save
    const mockSave = jest.fn().mockResolvedValue(true);
    const mockPortfolioInstance = {
      userId: "user123",
      usdBalance: 1000,
      currencies: [],
      save: mockSave,
    };

    Portfolio.mockImplementation((data) => {
      // Проверяваме дали конструкторът е извикан с правилните данни
      expect(data).toEqual({
        userId: "user123",
        usdBalance: 1000,
        currencies: [],
      });
      return mockPortfolioInstance;
    });

    const req = { user: { id: "user123" } };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    await getPortfolio(req, res);

    expect(Portfolio.findOne).toHaveBeenCalledWith({ userId: "user123" });
    expect(Portfolio).toHaveBeenCalledWith({
      userId: "user123",
      usdBalance: 1000,
      currencies: [],
    });
    expect(mockSave).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      portfolio: mockPortfolioInstance,
    });
  });

  it("should return existing portfolio if found", async () => {
    const mockPortfolio = {
      userId: "user123",
      usdBalance: 1500,
      currencies: [],
    };
    Portfolio.findOne.mockResolvedValue(mockPortfolio);

    const req = { user: { id: "user123" } };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    await getPortfolio(req, res);

    expect(Portfolio.findOne).toHaveBeenCalledWith({ userId: "user123" });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ portfolio: mockPortfolio });
  });

  it("should handle errors and return 500", async () => {
    Portfolio.findOne.mockRejectedValue(new Error("DB error"));

    const req = { user: { id: "user123" } };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    await getPortfolio(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    expect(console.error).toHaveBeenCalledWith(
      "Get portfolio error:",
      expect.any(Error)
    );
  });
});
