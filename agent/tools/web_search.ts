import FirecrawlApp from "@mendable/firecrawl-js";
import { jsonSchema } from "ai";

interface SearchParameters {
  query: string;
}

const webSearch = {
  description: "Search the web for up-to-date information using Firecrawl API.",
  parameters: jsonSchema<SearchParameters>({
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Search query to look up on the web",
      },
    },
    required: ["query"],
  }),
  execute: async ({ query }: SearchParameters) => {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      throw new Error(
        "FIRECRAWL_API_KEY is not defined in environment variables",
      );
    }

    const app = new FirecrawlApp({ apiKey });
    const searchResult = await app.search(query, { limit: 3 });

    return searchResult;
  },
};

export default webSearch;
