// import { defineAgent } from "eve";
import { groq } from "@ai-sdk/groq";

export const agent = {
  model: groq("qwen-2.5-32b"),
};

export default agent;
