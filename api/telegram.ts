declare const process: {
  env: {
    [key: string]: string | undefined;
  };
};

import { Bot, Context, Filter, webhookCallback } from "grammy";
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
