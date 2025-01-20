import { ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { getMessageStatus } from "~/utils/wp_api/functions.server";


export async function action({request}: ActionFunctionArgs){
    const formData = await request.formData()
    const message_id = formData.get("message_id") as string
    if(!message_id){
        throw new Error("message_id not found")
    }
    const data = await getMessageStatus(message_id)
    return { data}
}


export default function Get_WP_Status() {
  const actionData = useActionData<{
    data: { id: string; status: string; timestamp: string }[];
  } | null>();

  return (
    <div className="flex justify-center items-center min-h-screen flex-col">
      <Form method="post">
        <label
          htmlFor="message_id"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Enter Message Id
        </label>
        <input
          type="text"
          name="message_id"
          id="message_id"
          className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Send Message
        </button>
      </Form>
      <h2>Message Status</h2>
      <p>Status: </p>
      {actionData?.data ? <p>{actionData.data[0].status}</p> : null}
      <p>ID: </p>
      {actionData?.data ? <p>{actionData.data[0].id}</p> : null}
      <p>Timestamp: </p>
      {actionData?.data ? <p>{actionData.data[0].timestamp}</p> : null}
    </div>
  );
}
