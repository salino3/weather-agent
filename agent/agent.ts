// import { defineAgent } from "eve";
import { groq } from "@ai-sdk/groq";

export const agent = {
  model: groq("qwen3.6-27b"),
};

export default agent;
