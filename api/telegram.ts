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

export type TextContextType = Filter<Context, "message:text">;

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  throw new Error("TELEGRAM_BOT_TOKEN is not defined in environment variables");
}

const bot = new Bot(token);

bot.on("message:text", async (ctx: TextContextType) => {
  try {
    await ctx.replyWithChatAction("typing");

    const sanitizedInput: string = ctx.message.text.trim().slice(0, 500);

    const result = await generateText({
      model: agent.model,
      system: agent.systemPrompt,
      tools: {
        getWeather,
        webSearch,
      },
      stopWhen: stepCountIs(5),
      prompt: sanitizedInput,
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
bot.on("message:voice", async (ctx) => {
  try {
    await ctx.replyWithChatAction("typing");

    // 1. Get file path from Telegram
    const file = await ctx.getFile();
    const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;

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
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
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

    // 5. Send transcription audio feed using HTML parsing
    const escapedText = transcribedText
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    await ctx.reply(`<b>Audio:</b> "<i>${escapedText}</i>"`, {
      parse_mode: "HTML",
    });

    // 6. Send transcribed text to AI model
    const result = await generateText({
      model: agent.model,
      system: agent.systemPrompt,
      prompt: transcribedText,
    });

    await ctx.reply(result.text);
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
      res.status(200).send("OK");
    }
  }
}
