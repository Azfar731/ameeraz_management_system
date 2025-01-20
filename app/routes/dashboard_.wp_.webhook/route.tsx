import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WEBHOOK_VERIFY_TOKEN) {
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
    const payload = await request.json();

    if (payload.entry) {
      payload.entry.forEach((entry) => {
        entry.changes.forEach((change) => {
          if (change.field === "messages") {
            console.log("Received message status update:", change.value);
          }
        });
      });
    }

    return json({ message: "Webhook received successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};

export default function Webhook() {
  return (
    <div>
      <h1>This is the webhooks page</h1>
    </div>
  );
}
