// import { ActionFunctionArgs } from "@remix-run/node";
import { Form } from "@remix-run/react";
import {
  getInstaTemplateMessageInput,
  sendMessage,
} from "~/utils/wp_api/functions.server";

export async function action() {
  // const formData =await request.formData()
  // const message = formData.get("message") as string

  const recipient = process.env.RECIPIENT_WAID;

  if (!recipient) {
    throw new Error("Recipient env variable not found");
  }
  const wp_message_body = getInstaTemplateMessageInput({ recipient, imageUrl: "https://i.postimg.cc/52DXCf1d/deal1.jpg", customer_fname: "Azfar" });
  
  const resp: any = await sendMessage(wp_message_body);


  console.log("Cloud_API Response:");
  if (resp) {
    console.log("Status:", resp.status); // HTTP Status Code
    console.log("Response Data:", resp.data); // Full API response
    // console.log("Rate Limit Remaining:", resp.headers["x-ratelimit-remaining"]); // Remaining API calls
    console.log("Message ID:", resp.data.messages?.[0]?.id); // ID of the sent message
    console.log("Recipient WA ID:", resp.data.contacts?.[0]?.wa_id);
  } // WhatsApp ID of the recipient
  return null;
}

export default function Whatsapp_API() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Form
        method="post"
        className="bg-white mt-14 p-6 rounded shadow-md w-80 "
      >
        <label
          htmlFor="message"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Enter text to send
        </label>

        <input
          type="text"
          id="message"
          name="message"
          className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Send Message
        </button>
      </Form>

    </div>
  );
}
