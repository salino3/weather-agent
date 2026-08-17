import { defineAgent } from "eve";
import { groq } from "@ai-sdk/groq";

export default defineAgent({
  model: groq("qwen3.6-27b"),
});
