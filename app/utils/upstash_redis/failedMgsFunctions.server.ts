import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: "https://crucial-alpaca-59474.upstash.io", // Replace with your Upstash Redis URL
  token: process.env.UPSTASH_WP_MESSAGE_LOG_DB_TOKEN, // Replace with your Upstash Redis token
});

const FAILED_ZSET_KEY = "failed_messages"; // Redis key for tracking failed messages
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Cleans up failed messages older than 7 days.
 */
async function cleanupFailedMessages() {
  const now = Date.now();
  const oldestAllowedTimestamp = now - SEVEN_DAYS_MS;

  // Remove messages older than 7 days
  await redis.zremrangebyscore(FAILED_ZSET_KEY, 0, oldestAllowedTimestamp);
}

/**
 * Inserts a failed message into the Redis sorted set.
 * @param message - The failed message object containing details.
 */
async function recordFailedMessage(message: {
  mobile_num: string;
  status: string;
  timestamp: string
  errors?: {description: string; code: string;}[]
  
}) {
  const now = Date.now();
  const messageData = JSON.stringify(message);

  // Add the message to the sorted set with the timestamp as score
  await redis.zadd(FAILED_ZSET_KEY, { score: now, member: messageData });
}

async function getFailedMessages() {
    // First, clean up expired messages
    await cleanupFailedMessages();
  
    // Retrieve all remaining failed messages
    const failedMessages: string[] = await redis.zrange(FAILED_ZSET_KEY, 0, -1);
  
    // Parse JSON strings into objects
    return failedMessages.map((msg) => JSON.parse(msg));
  }

export { cleanupFailedMessages, recordFailedMessage, getFailedMessages };
