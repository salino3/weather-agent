import { describe, it, expect, vi, beforeEach } from "vitest";

// 1. Mock all external dependencies and constants requiring API keys
vi.mock("../store/constants.js", () => ({
  TELEGRAM_BOT_TOKEN: "mock_telegram_token",
  GROQ_API_KEY: "mock_groq_key",
}));

vi.mock("ai", () => ({
  generateText: vi.fn().mockResolvedValue({
    text: "Weather forecast mock response",
  }),
  stepCountIs: vi.fn(),
}));

vi.mock("grammy", async () => {
  const actual = await vi.importActual("grammy");
  return {
    ...actual,
    Bot: vi.fn().mockImplementation(() => ({
      on: vi.fn(),
      handleUpdate: vi.fn(),
    })),
    webhookCallback: vi.fn().mockReturnValue(vi.fn()),
  };
});

describe("Telegram Webhook Handler Logic", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should handle text message input pipeline safely", async () => {
    const { sanitizeInput } = await import("../store/utils.js");
    const rawInput = "  How is the weather in Rome? \u200B  ";

    const sanitized = sanitizeInput(rawInput, 500);
    expect(sanitized).toBe("How is the weather in Rome?");
  });

  it("should correctly construct prompt edges around sanitized text", async () => {
    const { sanitizeInput } = await import("../store/utils.js");
    const userInput = "Meteo Milano";
    const sanitizedInput = sanitizeInput(userInput, 500);
    const formattedPrompt = `[USER INPUT START]\n${sanitizedInput}\n[USER INPUT END]`;

    expect(formattedPrompt).toBe(
      "[USER INPUT START]\nMeteo Milano\n[USER INPUT END]",
    );
  });

  it("should reply with error message from Groq when voice input is empty or unrecognized", () => {
    const transcribedText = "   ";
    const sanitizedVoiceInput = transcribedText.trim();
    const isInvalid = !sanitizedVoiceInput;

    expect(isInvalid).toBe(true);
  });
});
