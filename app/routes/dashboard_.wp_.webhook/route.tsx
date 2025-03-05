import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { changeClientSubscribeStatus } from "~/utils/client/db.server";
import { recordFailedMessage } from "~/utils/upstash_redis/failedMgsFunctions.server";
import { WebhookObj } from "~/utils/webhooks/types.server";
import { sendFreeFormMessage } from "~/utils/wp_api/functions.server";
import { env } from "~/config/env.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === env.WEBHOOK_VERIFY_TOKEN) {
    console.log("verification successfull");
    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } else {
    console.log("verification failed");
    return new Response("Forbidden", { status: 403 });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const payload: WebhookObj = await request.json();

    if (payload.entry) {
      payload.entry.forEach((entry) => {
        entry.changes.forEach((change) => {
          if (change.field === "messages") {
            console.log("Received message status update:", change.value);

            // Iterate through messages
            if (change.value.messages) {
              change.value.messages.forEach(async (message) => {
                const phoneNumber = message.from; // Extract sender's phone number
                if (message.type === "button" && message.button?.payload) {
                  const buttonPayload = message.button.payload;

                  console.log("Button Payload:", buttonPayload);

                  if (buttonPayload === "Stop promotions") {
                    // Update subscription status in database
                    await changeClientSubscribeStatus({
                      status: false,
                      mobile_num: phoneNumber,
                    });

                    console.log(
                      `Client with phone ${phoneNumber} unsubscribed from promotions`
                    );

                    // Send confirmation message to user
                    await sendFreeFormMessage({
                      recipient: phoneNumber,
                      msg: `You have been successfully unsubscribed from our promotions. If you wish to start receiving updates again, simply type 'Sub' at any time.. `,
                    });
                  }
                } else if (message.type === "text" && message.text.body) {
                  if (message.text.body.match(/^sub$/i)) {
                    await changeClientSubscribeStatus({
                      status: true,
                      mobile_num: phoneNumber,
                    });
                  }
                  console.log(
                    `Client with phone ${phoneNumber} subscribed to promotions`
                  );
                  // Send confirmation message to user
                  await sendFreeFormMessage({
                    recipient: phoneNumber,
                    msg: `You have been successfully subscribed to promotions`,
                  });
                }
              });
            }
            if (change.value.statuses) {
              change.value.statuses.forEach((statusObj) => {
                if (statusObj.status === "failed") {
                  recordFailedMessage({
                    status: statusObj.status,
                    mobile_num: statusObj.recipient_id,
                    timestamp: statusObj.timestamp,
                    errors: statusObj.errors?.map((err) => {
                      return {
                        code: err.code,
                        description: err.error_data.details,
                      };
                    }),
                  });
                }
              });
            }
          }
        });
      });
    }

    return new Response("Webhook received successfully", { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
