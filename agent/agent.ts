// import { defineAgent } from "eve";
import { groq } from "@ai-sdk/groq";

export const agent = {
  model: groq("llama-3.1-8b-instant"),
};

export default agent;
