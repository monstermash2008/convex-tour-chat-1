import { api } from "./_generated/api";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    // Grab the most recent messages.
    const messages = await ctx.db.query("messages").order("desc").take(100);
    // Reverse the list so that it's in a chronological order.
    const messagesWithLikes = await Promise.all(
      messages.map(async (message) => {
        const likes = await ctx.db
          .query("likes")
          .withIndex("byMessageId", (q) => q.eq("messageId", message._id))
          .collect();
        return {
          ...message,
          likes: likes.length,
        };
      })
    );

    return messagesWithLikes.reverse().map((message) => ({
      ...message,
      body: message.body.replaceAll(":)", "😊"),
    }));
  },
});

export const send = mutation({
  args: { body: v.string(), author: v.string() },
  handler: async (ctx, { body, author }) => {
    // Send a new message.
    await ctx.db.insert("messages", { body, author });
    // Schedule AI to respond to certain messages
    if (body.startsWith("@ai") && author !== "AI")
      await ctx.scheduler.runAfter(0, api.ai.chat, {
        messageBody: body,
      });
  },
});

export const like = mutation({
  args: { liker: v.string(), messageId: v.id("messages") },
  handler: async (ctx, { liker, messageId }) => {
    await ctx.db.insert("likes", { liker, messageId });
  },
});
