import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import Together from "together-ai";

export const chat = action({
  args: { messageBody: v.string() },
  handler: async (ctx, { messageBody }) => {
    const together = new Together({ apiKey: process.env.TOGETHER_API_KEY });

    const response = await together.chat.completions.create({
      model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful and intelligent bot for a chat app. Provide detailed responses when required, otherwise keep them short and consise.",
        },
        {
          role: "user",
          content: messageBody,
        },
      ],
    });

    const messageContent = response.choices[0].message?.content;

    await ctx.runMutation(api.messages.send, {
      author: "AI Agent",
      body: messageContent || "Sorry, I don't have an answer for that.",
    });
  },
});
