declare const process: {
  env: {
    [key: string]: string | undefined;
  };
};

import { Bot, webhookCallback } from "grammy";
import { generateText } from "ai";
import agent from "../agent/agent";
import getWeather from "../agent/tools/get_weather";
import webSearch from "../agent/tools/web_search";

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

    await ctx.reply(text);
  } catch (error) {
    console.error("Error processing message:", error);
    await ctx.reply(
      "Sorry, something went wrong while processing your request.",
    );
  }
});

export default webhookCallback(bot, "std/http");
