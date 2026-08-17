declare const process: {
  env: {
    [key: string]: string | undefined;
  };
};

import { Bot, webhookCallback } from "grammy";
import { generateText } from "ai";
import agent from "../agent/agent.js";
import getWeather from "../agent/tools/get_weather.js";
import webSearch from "../agent/tools/web_search.js";

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  throw new Error("TELEGRAM_BOT_TOKEN is not defined in environment variables");
}

const bot = new Bot(token);

bot.on("message:text", async (ctx) => {
  try {
    await ctx.replyWithChatAction("typing");

    const { text } = await generateText({
      model: agent.model,
      tools: {
        getWeather,
        webSearch,
      },
      prompt: ctx.message.text,
    });

    const messageToSend =
      text && text.trim().length > 0
        ? text
        : "I processed your query successfully, but there was no text response to generate.";

    await ctx.reply(messageToSend);
  } catch (error) {
    console.error("Error processing message:", error);
    await ctx.reply(
      "Sorry, something went wrong while processing your request.",
    );
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
