import { LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import { authenticate } from "~/utils/auth/functions.server";
import { LogErrorMessages, LogWithLocalTime } from "~/utils/logs/types";
import { CompactTable } from "@table-library/react-table-library/compact";
import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";
import Select from "react-select";
import { useRef, useState } from "react";
import { fetchLogsSchema } from "~/utils/logs/validation.server";
import { getLogs } from "~/utils/logs/db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate({ request, requiredClearanceLevel: 4 });
  const searchParams = new URL(request.url).searchParams;
  const searchParamValues = fetchSearchParameters(searchParams);
  const validationResult = fetchLogsSchema.safeParse(searchParamValues);
  if (!validationResult.success) {
    return {
      logs: [],
      errorMessages: validationResult.error.flatten().fieldErrors,
    };
  }
  console.log("Validation Result: ", validationResult.data);
  const logs = await getLogs(validationResult.data);
  return { logs, errorMessages: {} };
}

function fetchSearchParameters(searchParams: URLSearchParams) {
  for (const [key, value] of searchParams.entries()) {
    if (value === "") {
      searchParams.delete(key);
    }
  }
  const startDate = searchParams.get("start_date") || undefined;
  const endDate = searchParams.get("end_date") || undefined;
  const userId = searchParams.get("userId") || undefined;
  const userName = searchParams.get("userName") || undefined;
  const log_type = searchParams.getAll("log_type").filter((val) => val !== "");

  return {
    startDate,
    endDate,
    userId,
    userName,
    log_type: log_type.length > 0 ? log_type : undefined,
  };
}

export default function Logs() {
  const { logs, errorMessages } = useLoaderData<{
    logs: LogWithLocalTime[];
    errorMessages: LogErrorMessages;
  }>();
  const formattedLogs = logs.map((log) => {
    const dateObject = new Date(log.created_at);
    const localTime = new Date(dateObject.getTime() + 5 * 60 * 60 * 1000); // Add 5 hours (5 * 60 min * 60 sec * 1000 ms)

    return {
      ...log,
      created_at_local: localTime.toISOString().replace("T", " ").split(".")[0], // Format: "YYYY-MM-DD HH:MM:SS"
    };
  });
  const navigation = useNavigation();
  const currentDate = useRef(new Date().toISOString().split("T")[0]);
  //table values
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const nodes = [...formattedLogs];
  const data = { nodes };

  const COLUMNS = [
    {
      label: "Created At",
      renderCell: (item: LogWithLocalTime) => item.created_at_local,
    },
    {
      label: "UserId",
      renderCell: (item: LogWithLocalTime) => `${item.userId}`,
    },
    {
      label: "UserName",
      renderCell: (item: LogWithLocalTime) => `${item.user.userName}`,
    },
    {
      label: "Message",
      renderCell: (item: LogWithLocalTime) => item.log_message,
    },
    {
      label: "Log Type",
      renderCell: (item: LogWithLocalTime) => item.log_type,
    },
  ];

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

  const handleExpand = (record: LogWithLocalTime) => {
    if (expandedIds.includes(record.id)) {
      setExpandedIds(expandedIds.filter((id) => id !== record.id));
    } else {
      setExpandedIds([...expandedIds, record.id]);
    }
  };
  const ROW_PROPS = {
    onClick: handleExpand,
  };

  const ROW_OPTIONS = {
    renderAfterRow: (record: LogWithLocalTime) => (
      <>
        {expandedIds.includes(record.id) && (
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
                  <strong>UserId:</strong> {record.userId}
                </li>
                <li>
                  <strong>Message:</strong> {record.log_message}
                </li>
                <li>
                  <strong>Created At:</strong> {record.created_at_local}
                </li>
              </ul>
            </td>
          </tr>
        )}
      </>
    ),
  };

  return (
    <div className="m-4 pb-4">
      <div className="w-full flex justify-center items-center">
        <h1 className="font-semibold text-6xl text-gray-700">Logs</h1>
      </div>
      <Form method="get" className="rounded w-1/2">
        <h2 className="text-3xl font-semibold text-gray-700 mt-6">
          Search Records
        </h2>
        <label
          htmlFor="start_date"
          className="block text-gray-700 text-sm font-bold mt-4"
        >
          Starting Date
        </label>
        <input
          id="start_date"
          name="start_date"
          aria-label="Date"
          type="date"
          max={currentDate.current}
          className=" mt-2 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-2.5 w-full sm:text-sm"
        />
        {errorMessages?.start_date && (
          <h2 className="text-red-500 font-semibold">
            {errorMessages.start_date[0]}
          </h2>
        )}
        <label
          htmlFor="end_date"
          className="block text-gray-700 text-sm font-bold mt-4"
        >
          Ending Date
        </label>
        <input
          id="end_date"
          name="end_date"
          aria-label="Date"
          type="date"
          max={currentDate.current}
          className=" mt-2 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-2.5 w-full sm:text-sm"
        />
        {errorMessages?.end_date && (
          <h2 className="text-red-500 font-semibold">
            {errorMessages.end_date[0]}
          </h2>
        )}
        <label
          htmlFor="userId"
          className="block text-gray-700 text-sm font-bold mt-4"
        >
          User ID
        </label>
        <input
          type="text"
          id="userId"
          name="userId"
          className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
        />
        {errorMessages?.userId && (
          <h2 className="text-red-500 font-semibold">
            {errorMessages.userId[0]}
          </h2>
        )}
        <label
          htmlFor="userName"
          className="block text-gray-700 text-sm font-bold mt-4"
        >
          User Name
        </label>
        <input
          type="text"
          id="userName"
          name="userName"
          className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
        />
        {errorMessages?.userName && (
          <h2 className="text-red-500 font-semibold">
            {errorMessages.userName[0]}
          </h2>
        )}
        <label
          htmlFor="log_type"
          className="block text-gray-700 text-sm font-bold mt-4"
        >
          Log Type
        </label>
        <Select
          isMulti
          name="log_type"
          options={[
            { value: "loggedIn", label: "loggedIn" },
            { value: "loggedOut", label: "loggedOut" },
            { value: "create", label: "create" },
            { value: "read", label: "read" },
            { value: "update", label: "update" },
            { value: "delete", label: "delete" },
          ]}
          className="basic-multi-select mt-2 z-10"
          classNamePrefix="select"
        />
        {errorMessages?.log_type && (
          <h2 className="text-red-500 font-semibold">
            {errorMessages.log_type[0]}
          </h2>
        )}
        <button
          type="submit"
          disabled={
            navigation.state === "submitting" || navigation.state === "loading"
          }
          className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Fetch
        </button>
      </Form>

      <div className="mt-20">
        <div className="mt-6 ">
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
