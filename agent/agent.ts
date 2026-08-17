// import { defineAgent } from "eve";
import { groq } from "@ai-sdk/groq";

export const agent = {
  model: groq("llama-3.3-70b-versatile"),
};

export default agent;
