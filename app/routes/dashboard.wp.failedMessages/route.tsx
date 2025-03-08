import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { cleanupFailedMessages, getFailedMessages } from "~/utils/upstash_redis/failedMgsFunctions.server";
import { failed_message } from "~/utils/upstash_redis/types";

import { CompactTable } from "@table-library/react-table-library/compact";
import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";
import { ActionFunctionArgs } from "@remix-run/node";

export async function loader() {
  const failed_messages = await getFailedMessages();

  return { failed_messages };
}

export async function action({ request }: ActionFunctionArgs) {
  
  console.log("formData MEthod: ", request.method)
  if (request.method === "DELETE") {
    console.log("Delete request received");
    const deletedCount = await cleanupFailedMessages(0)
    return {deletedCount}
  }
  return null
}

export default function Failed_Messages() {
  const { failed_messages } = useLoaderData<{
    failed_messages: failed_message[];
  }>();
  const actionData = useActionData<{deletedCount: number}>()
 
  const [ids, setIds] = useState<string[]>([]);
  const nodes = [...failed_messages];
  const data = { nodes };

  const COLUMNS = [
    {
      label: "Time",
      renderCell: (item: failed_message) => item.timestamp,
    },
    {
      label: "Mobile Num",
      renderCell: (item: failed_message) => item.mobile_num,
    },
    {
      label: "Code",
      renderCell: (item: failed_message) => item.errors && item.errors[0].code,
    },
    {
      label: "Descriptiion",
      renderCell: (item: failed_message) =>
        item.errors && item.errors[0].description,
    },
  ];

  const handleExpand = (item: failed_message) => {
    if (ids.includes(item.timestamp)) {
      setIds(ids.filter((id) => id !== item.timestamp));
    } else {
      setIds(ids.concat(item.timestamp));
    }
  };

  const ROW_PROPS = {
    onClick: handleExpand,
  };

  const ROW_OPTIONS = {
    renderAfterRow: (item: failed_message) => (
      <>
        {ids.includes(item.timestamp) && (
          <tr style={{ display: "flex", gridColumn: "1 / -1" }}>
            <td style={{ flex: "1" }}>
              <ul
                style={{
                  margin: "0",
                  padding: "0",
                  backgroundColor: "#e0e0e0",
                }}
              >
                <li>
                  <strong>Description: </strong>
                  {item.errors && item.errors[0].description}
                </li>
              </ul>
            </td>
          </tr>
        )}
      </>
    ),
  };

  const theme = useTheme([
    getTheme(),
    {
      HeaderRow: `
               background-color: #eaf5fd;
             `,
      Row: `
               &:nth-of-type(odd) {
                 background-color: #d2e9fb;
               }
 
               &:nth-of-type(even) {
                 background-color: #eaf5fd;
               }
             `,
    },
  ]);

  return (
    <div className="m-8">
      <div className="w-full flex justify-center items-center ">
        <h1 className=" font-semibold text-4xl text-gray-700">
          Failed Messages
        </h1>
      </div>
      <div className="mt-10">
        <div className="w-full flex justify-between items-right">
          <Form method="delete">
            <button
              className="w-60 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            >
              Clear Messages
            </button>
          </Form>
        </div>
        {actionData &&  <p className="text-red-500 font-semibold">{actionData.deletedCount > 0 ? `Deleted ${actionData.deletedCount} Messages` : "No Messages to Delete"}</p>}
        <div className="mt-6">
          <CompactTable
            columns={COLUMNS}
            data={data}
            theme={theme}
            rowProps={ROW_PROPS}
            rowOptions={ROW_OPTIONS}
          />
        </div>
      </div>
    </div>
  );
}
