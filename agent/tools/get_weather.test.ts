import { describe, it, expect, vi } from "vitest";
import getWeather from "./get_weather.js";

describe("getWeather tool", () => {
  it("should execute weather tool with latitude and longitude", async () => {
    // Mock di global.fetch to avoid making real network calls during testing
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ current_weather: { temperature: 22.5 } }),
    } as Response);

    const result = await getWeather.execute(
      { latitude: 45.4642, longitude: 9.19 },
      { messages: [] } as any,
    );

    expect(result).toHaveProperty("current_weather");
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("latitude=45.4642&longitude=9.19"),
    );
  });
});
