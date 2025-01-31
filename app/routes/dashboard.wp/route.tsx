// import { ActionFunctionArgs } from "@remix-run/node";
import { Template_Variable } from "@prisma/client";
import { SerializeFrom } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import Select from "react-select";
import { getClientCount } from "~/utils/client/db.server";
import { getAllTemplates } from "~/utils/templates/db.server";
import { TemplateWithRelations } from "~/utils/templates/types";
import { remainingDailyLimit } from "~/utils/upstash_redis/functions.server";
// import {
//   getInstaTemplateMessageInput,
//   sendMessage,
// } from "~/utils/wp_api/functions.server";

export async function loader() {
  const templates = await getAllTemplates();
  const remainingLimit = await remainingDailyLimit();
  const clientCount = await getClientCount();
  const numOfClientBatches = Math.ceil(clientCount / 230);
  return { templates, remainingLimit, numOfClientBatches };
}

export async function action() {
  // const formData =await request.formData()
  // const message = formData.get("message") as string

  // const recipient = process.env.RECIPIENT_WAID;

  // if (!recipient) {
  //   throw new Error("Recipient env variable not found");
  // }
  // const wp_message_body = getInstaTemplateMessageInput({
  //   recipient,
  //   imageUrl: "https://i.postimg.cc/52DXCf1d/deal1.jpg",
  //   customer_fname: "Azfar",
  // });

  // const resp: any = await sendMessage(wp_message_body);

  // console.log("Cloud_API Response:");
  // if (resp) {
  //   console.log("Status:", resp.status); // HTTP Status Code
  //   console.log("Response Data:", resp.data); // Full API response
  //   // console.log("Rate Limit Remaining:", resp.headers["x-ratelimit-remaining"]); // Remaining API calls
  //   console.log("Message ID:", resp.data.messages?.[0]?.id); // ID of the sent message
  //   console.log("Recipient WA ID:", resp.data.contacts?.[0]?.wa_id);
  // } // WhatsApp ID of the recipient
  return null;
}

export default function Whatsapp_API() {
  const { templates, remainingLimit, numOfClientBatches } = useLoaderData<{
    templates: TemplateWithRelations[];
    remainingLimit: number;
    numOfClientBatches: number;
  }>();
  const [chosenTemplate, setChosenTemplate] = useState<
    SerializeFrom<TemplateWithRelations> | undefined
  >(undefined);

  const template_options = templates.map((template) => ({
    value: template.name,
    label: template.name,
  }));
  return (
    <div className="flex  justify-center items-center min-h-screen">
      <Form
        method="post"
        className="bg-white mt-14 p-6 rounded shadow-md w-80 "
      >
        <div className="w-full flex justify-center items-center">
          <h1 className="block text-gray-700 text-2xl font-bold mt-2 mb-2">
            Send Whatsapp Messsages
          </h1>
        </div>
        <div className="block text-gray-700 text-sm font-bold mb-2">
          Remaining Daily Limit
          <span className="font-semibold">{`: ${remainingLimit}`}</span>
        </div>
        <label
          htmlFor="template_name"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Choose Template
        </label>
        <Select
          id="template_name"
          name="template_name"
          options={template_options}
          value={
            chosenTemplate
              ? { value: chosenTemplate.name, label: chosenTemplate.name }
              : undefined
          }
          onChange={(selectedOption) => {
            setChosenTemplate(
              templates.find(
                (template) => template.name === selectedOption?.value
              )
            );
          }}
          className="basic-multi-select mb-4"
          classNamePrefix="select"
        />
        {chosenTemplate && chosenTemplate.header_type !== "none" && (
          <>
            <h3 className="font-medium text-gray-700">Header</h3>
            <label
              htmlFor="header_value"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              {chosenTemplate.header_type === "text"
                ? chosenTemplate.header_var_name
                : `${chosenTemplate.header_type} URL`}
            </label>
            <input
              type="text"
              name="header_value"
              id="header_value"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
              required
            />
          </>
        )}
        {chosenTemplate?.variables && chosenTemplate.variables.length > 0 && (
          <>
            <h3 className="font-medium text-gray-700">Body</h3>
            <Variable_fields variables={chosenTemplate.variables} />
          </>
        )}
        <div className="block text-gray-700 text-sm font-bold mb-2">
          Total Client Batches
          <span className="font-semibold">{`: ${numOfClientBatches}`}</span>
        </div>
        <label
          htmlFor="client_batch"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Choose the Client Batch
        </label>
        <input
          type="number"
          name="client_batch"
          id="client_batch"
          className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
          min={1}
          max={numOfClientBatches}
          required
        />
       
        <div className="w-full flex justify-center items-center">
          <button
            type="submit"
            className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Send Messages
          </button>
        </div>
      </Form>
    </div>
  );
}

function Variable_fields({ variables }: { variables: Template_Variable[] }) {
  return (
    <div>
      {variables.filter(variable => variable.input_required === "true" ).map((variable) => (
        <div key={variable.name}>
          <label
            htmlFor={variable.name}
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            {variable.name}
          </label>
          <input
            type="text"
            name={variable.name}
            id={variable.name}
            className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
          />
        </div>
      ))}
    </div>
  );
}
