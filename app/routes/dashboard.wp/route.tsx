// import { ActionFunctionArgs } from "@remix-run/node";
import { Template_Variable } from "@prisma/client";
import { ActionFunctionArgs, SerializeFrom } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useSubmit,
} from "@remix-run/react";
import { useState } from "react";
import Select from "react-select";
import { getClientCount, getRangeofClients } from "~/utils/client/db.server";
import { getAllTemplates } from "~/utils/templates/db.server";
import { TemplateWithRelations } from "~/utils/templates/types";
import {
  canSendMessages,
  remainingDailyLimit,
} from "~/utils/upstash_redis/functions.server";
import { WhatsappTemplateDataValidation } from "~/utils/wp_api/validations.server";
import { WP_ErrorMessages } from "~/utils/wp_api/types";
import { sendMultipleMessages } from "~/utils/wp_api/functions.server";
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

export async function action({ request }: ActionFunctionArgs) {
  const recvdData = await request.json();
  const validationResult = WhatsappTemplateDataValidation.safeParse(recvdData);
  if (!validationResult.success) {
    return { errorMessages: validationResult.error.flatten().fieldErrors };
  }
  const data = validationResult.data;
  const daily_limit = parseInt(
    process.env.WP_DAILY_LIMIT ? process.env.WP_DAILY_LIMIT : "230"
  );
  const clients = await getRangeofClients({
    startIndex: data.client_batch * daily_limit,
    total: daily_limit,
  });
  if (!canSendMessages(clients.length)) {
    throw new Error("Daily Limit Exceeded");
  }
  const failed_messages = await sendMultipleMessages({
    template_name: data.template_name,
    clientsList: clients,
    headerValue: data.header_value,
    variablesArray: data.variables_array,

  });
  console.log("Failed Messages: ", failed_messages)
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

  const submit = useSubmit();
  const actionData = useActionData<{ errorMessages: WP_ErrorMessages }>();
  const template_options = templates.map((template) => ({
    value: template.name,
    label: template.name,
  }));

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const formObject = Object.fromEntries(formData.entries());
    const data = {
      ...formObject,
      header_type: chosenTemplate?.header_type || "none",
      variables_array:
        chosenTemplate?.variables
          .filter((variables) => variables.input_required === "true")
          .map((variable) => ({
            key: variable.name,
            value: formObject[variable.name] as string,
          })) || [],
    };
    console.log("Data: ", data);
    submit(data, { method: "post", encType: "application/json" });
  };
  return (
    <div className="flex  justify-center items-center min-h-screen">
      <Form
        method="post"
        onSubmit={handleSubmit}
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
        {actionData?.errorMessages?.template_name && (
          <h2 className="text-red-500 font-semibold">
            {actionData?.errorMessages.template_name[0]}
          </h2>
        )}
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
            {actionData?.errorMessages?.header_value && (
              <h2 className="text-red-500 font-semibold">
                {actionData?.errorMessages.header_value[0]}
              </h2>
            )}
          </>
        )}
        {chosenTemplate?.variables && chosenTemplate.variables.length > 0 && (
          <>
            <h3 className="font-medium text-gray-700">Body</h3>
            <Variable_fields variables={chosenTemplate.variables} />
            {actionData?.errorMessages?.variables_array && (
              <h2 className="text-red-500 font-semibold">
                {actionData?.errorMessages.variables_array[0]}
              </h2>
            )}
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
        {actionData?.errorMessages?.client_batch && (
          <h2 className="text-red-500 font-semibold">
            {actionData?.errorMessages.client_batch[0]}
          </h2>
        )}

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
      {variables
        .filter((variable) => variable.input_required === "true")
        .map((variable) => (
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
