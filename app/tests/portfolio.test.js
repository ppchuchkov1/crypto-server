const { getWallet } = require("../wallet/wallet.controller");
const Wallet = require("../wallet/wallet.model");

jest.mock("../wallet/wallet.model");

describe("Wallet Controller - getWallet", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should create and return a new wallet if none found", async () => {
    Wallet.findOne.mockResolvedValue(null);

    const mockSave = jest.fn().mockResolvedValue(true);
    const mockWalletInstance = {
      userId: "user123",
      usdBalance: 1000,
      currencies: [],
      save: mockSave,
    };

    Wallet.mockImplementation((data) => {
      expect(data).toEqual({
        userId: "user123",
        usdBalance: 1000,
        currencies: [],
      });
      return mockWalletInstance;
    });

    const req = { user: { id: "user123" } };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    await getWallet(req, res);

    expect(Wallet.findOne).toHaveBeenCalledWith({ userId: "user123" });
    expect(Wallet).toHaveBeenCalledWith({
      userId: "user123",
      usdBalance: 1000,
      currencies: [],
    });
    expect(mockSave).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      wallet: mockWalletInstance,
    });
  });

  it("should return existing wallet if found", async () => {
    const mockWallet = {
      userId: "user123",
      usdBalance: 1500,
      currencies: [],
    };
    Wallet.findOne.mockResolvedValue(mockWallet);

    const req = { user: { id: "user123" } };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    await getWallet(req, res);

    expect(Wallet.findOne).toHaveBeenCalledWith({ userId: "user123" });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ wallet: mockWallet });
  });

  it("should handle errors and return 500", async () => {
    Wallet.findOne.mockRejectedValue(new Error("DB error"));

    const req = { user: { id: "user123" } };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    await getWallet(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    expect(console.error).toHaveBeenCalledWith(
      "Get wallet error:",
      expect.any(Error)
    );
  });
});
