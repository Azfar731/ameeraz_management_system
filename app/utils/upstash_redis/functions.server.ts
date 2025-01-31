import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: "https://crucial-alpaca-59474.upstash.io", // Replace with your Upstash Redis URL
  token: process.env.UPSTASH_WP_MESSAGE_LOG_DB_TOKEN, // Replace with your Upstash Redis token
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

// Function to send a WhatsApp message
// async function sendMessage(client) {
//   return fetch("https://graph.facebook.com/v15.0/PHONE_NUMBER_ID/messages", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer YOUR_ACCESS_TOKEN`, // Replace with your API token
//     },
//     body: JSON.stringify({
//       messaging_product: "whatsapp",
//       to: client.phone,
//       type: "text",
//       text: { body: client.message },
//     }),
//   });
// }

// Netlify handler function
export async function handler(event) {
  const { clients } = JSON.parse(event.body);

  if (!clients || clients.length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "No clients provided" }),
    };
  }

  // Check if messages can be sent within the rolling limit
  const canSend = await canSendMessages(clients.length);
  if (!canSend) {
    return {
      statusCode: 429,
      body: JSON.stringify({ error: "Daily message limit reached" }),
    };
  }

  // Send messages and record them in Redis
  for (const client of clients) {
    await sendMessage(client);
  }

  await recordMessage(clients.length);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Messages sent successfully" }),
  };
}


export { remainingDailyLimit, canSendMessages, recordMessage };