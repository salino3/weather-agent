import { tool, jsonSchema } from "ai";

interface WeatherParameters {
  latitude: number;
  longitude: number;
  date?: string;
}

const getWeather = tool({
  description:
    "Get current, past, or forecast weather data for a specific location using Open-Meteo API.",
  inputSchema: jsonSchema<WeatherParameters>({
    type: "object",
    properties: {
      latitude: {
        type: "number",
        description: "Latitude coordinate of the location",
      },
      longitude: {
        type: "number",
        description: "Longitude coordinate of the location",
      },
      date: {
        type: "string",
        description:
          "Date in YYYY-MM-DD format for historical or forecast data",
      },
    },
    required: ["latitude", "longitude"],
  }),
  execute: async ({ latitude, longitude, date }: WeatherParameters) => {
    let url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;

    if (date) {
      url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&start_date=${date}&end_date=${date}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch weather data: ${response.statusText}`);
    }

    return await response.json();
  },
});

export default getWeather;
