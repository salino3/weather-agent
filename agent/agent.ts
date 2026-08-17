// import { defineAgent } from "eve";
import { groq } from "@ai-sdk/groq";

export const agent = {
  model: groq("openai/gpt-oss-20b"),
};

export default agent;
