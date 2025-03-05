import { Redis } from "@upstash/redis";
import { env } from "~/config/env.server";

const redis = new Redis({
  url: "https://crucial-alpaca-59474.upstash.io", // Replace with your Upstash Redis URL
  token: env.UPSTASH_WP_MESSAGE_LOG_DB_TOKEN, // Replace with your Upstash Redis token
});

const DAILY_LIMIT = 230; // Max messages allowed in 24 hours
const WINDOW_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const ZSET_KEY = "waba_message_tracking"; // Redis key for tracking messages

// Function to clean up expired messages and count the ones within the rolling window
async function canSendMessages(count: number) {
  const now = Date.now();
  const oldestAllowedTimestamp = now - WINDOW_DURATION;

  // Remove timestamps older than 24 hours
  await redis.zremrangebyscore(ZSET_KEY, 0, oldestAllowedTimestamp);

  // Count messages within the last 24 hours
  const currentCount = await redis.zcard(ZSET_KEY);

  return currentCount + count <= DAILY_LIMIT;
}

async function remainingDailyLimit(){
  const now = Date.now();
  const oldestAllowedTimestamp = now - WINDOW_DURATION;

  // Remove timestamps older than 24 hours
  await redis.zremrangebyscore(ZSET_KEY, 0, oldestAllowedTimestamp);

  // Count messages within the last 24 hours
  const currentCount = await redis.zcard(ZSET_KEY);

  return DAILY_LIMIT - currentCount;
}

// Function to add new messages to the rolling window
async function recordMessage(count: number) {
  const now = Date.now();

  // Add each message with its timestamp as the score
  const commands = [];
  for (let i = 0; i < count; i++) {
    commands.push(redis.zadd(ZSET_KEY, { score: now, member: `message:${now}:${i}` }));
  }

  // Execute all commands (Upstash handles batching internally)
  await Promise.all(commands);
}



export { remainingDailyLimit, canSendMessages, recordMessage };