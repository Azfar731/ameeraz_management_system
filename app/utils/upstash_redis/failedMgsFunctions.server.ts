import { Redis } from "@upstash/redis";
import { failed_message } from "./types";
import { env } from "~/config/env.server";
const redis = new Redis({
  url: "https://crucial-alpaca-59474.upstash.io", // Replace with your Upstash Redis URL
  token: env.UPSTASH_WP_MESSAGE_LOG_DB_TOKEN, // Replace with your Upstash Redis token
});

const FAILED_ZSET_KEY = "failed_messages"; // Redis key for tracking failed messages
// const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Cleans up failed messages older than 7 days.
 */
async function cleanupFailedMessages(days: number) {
  const now = Date.now();
  const days_in_ms = days * 24 * 60 * 60 * 1000;
  const oldestAllowedTimestamp = now - days_in_ms;

  // Remove messages older than 7 days
  const deletedCount = await redis.zremrangebyscore(FAILED_ZSET_KEY, 0, oldestAllowedTimestamp);
  return deletedCount
}

/**
 * Inserts a failed message into the Redis sorted set.
 * @param message - The failed message object containing details.
 */
async function recordFailedMessage(message: failed_message) {
  const now = Date.now();
  const messageData = JSON.stringify(message);

  // Add the message to the sorted set with the timestamp as score
  await redis.zadd(FAILED_ZSET_KEY, { score: now, member: messageData });
}

async function getFailedMessages() {
  // First, clean up expired messages
  await cleanupFailedMessages(7);

  // Retrieve all remaining failed messages
  const failedMessages: string[] = await redis.zrange(FAILED_ZSET_KEY, 0, -1);

  return failedMessages
}

export { cleanupFailedMessages, getFailedMessages, recordFailedMessage };
