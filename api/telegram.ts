declare const process: {
  env: {
    [key: string]: string | undefined;
  };
};

import { Bot, Context, Filter, webhookCallback } from "grammy";
import { Buffer } from "buffer";
import { generateText, stepCountIs } from "ai";
import agent from "../agent/agent.js";
import getWeather from "../agent/tools/get_weather.js";
import webSearch from "../agent/tools/web_search.js";
import { getLanguage, sanitizeInput } from "../store/utils.js";
import {
  GROQ_API_KEY,
  TELEGRAM_BOT_TOKEN,
  messages,
} from "../store/constants.js";

export type TextContextType = Filter<Context, "message:text">;
export type VoiceContextType = Filter<Context, "message:voice">;

const token = TELEGRAM_BOT_TOKEN;

if (!token) {
  throw new Error("TELEGRAM_BOT_TOKEN is not defined in environment variables");
}

const bot = new Bot(token);

bot.command("start", async (ctx) => {
  const lang = getLanguage(ctx);
  await ctx.reply(messages.start[lang], { parse_mode: "Markdown" });
});

bot.command("help", async (ctx) => {
  const lang = getLanguage(ctx);
  await ctx.reply(messages.help[lang]);
});

bot.on("message:text", async (ctx: TextContextType) => {
  try {
    await ctx.replyWithChatAction("typing");

    const sanitizedTextInput = sanitizeInput(ctx.message.text, 500);

    const result = await generateText({
      model: agent.model,
      system: agent.systemPrompt,
      tools: {
        getWeather,
        webSearch,
      },
      stopWhen: stepCountIs(5),
      prompt: `[USER INPUT START]\n${sanitizedTextInput}\n[USER INPUT END]`,
    });

    const generatedText: string =
      result.text || result.steps?.at(-1)?.text || "No response generated.";

    const finalResponse: string = `${generatedText}\n\nWeather data by Open-Meteo.com (https://open-meteo.com/)`;

    await ctx.reply(finalResponse);
  } catch (error) {
    console.error("Error processing message:", error);
    await ctx.reply(
      "Sorry, something went wrong while processing your request.",
    );
  }
});

//
bot.on("message:voice", async (ctx: VoiceContextType) => {
  try {
    await ctx.replyWithChatAction("typing");

    // 1. Get file path from Telegram
    const file = await ctx.getFile();
    const fileUrl = `https://api.telegram.org/file/bot${token}/${file.file_path}`;

    // 2. Download audio file as Buffer
    const response = await fetch(fileUrl);
    const audioArrayBuffer = await response.arrayBuffer();
    const audioBuffer = Buffer.from(audioArrayBuffer);

    // 3. Prepare FormData for Groq Whisper API
    const formData = new FormData();
    const blob = new Blob([audioBuffer], { type: "audio/ogg" });
    formData.append("file", blob, "voice.ogg");
    formData.append("model", "whisper-large-v3");

    // 4. Request transcription
    const whisperRes = await fetch(
      "https://api.groq.com/openai/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: formData,
      },
    );

    const whisperData = await whisperRes.json();
    const transcribedText = whisperData.text;

    if (!transcribedText || transcribedText.trim() === "") {
      await ctx.reply("Audio not recognized. Please try speaking again.");
      return;
    }

    const sanitizedVoiceInput = sanitizeInput(transcribedText, 500);

    if (!sanitizedVoiceInput) {
      await ctx.reply("Audio not recognized. Please try speaking again.");
      return;
    }

    // 5. Send transcribed text to AI model with Tools & Step Count
    const result = await generateText({
      model: agent.model,
      system: agent.systemPrompt,
      tools: {
        getWeather,
        webSearch,
      },
      stopWhen: stepCountIs(5),
      prompt: `[USER INPUT START]\n${sanitizedVoiceInput}\n[USER INPUT END]`,
    });

    // 6. Append attribution line
    const finalResponse = `${result.text}\n\nWeather data by Open-Meteo.com (https://open-meteo.com/)`;

    await ctx.reply(finalResponse);
  } catch (error) {
    console.error("Error processing voice message:", error);
    await ctx.reply("An error occurred while processing the voice message.");
  }
});

const handleUpdate = webhookCallback(bot, "http");

export default async function handler(req: any, res: any) {
  try {
    await handleUpdate(req, res);
  } catch (err) {
    console.error("Webhook error:", err);
    if (!res.headersSent) {
      // Even in case of error returning '200' for avoid Telegram send again and again the message
      res.status(200).send("OK");
    }
  }
}
