import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export async function loader({ request }: LoaderFunctionArgs) {
  const failed_messages = new URL(request.url).searchParams.get(
    "failed_messages"
  );
  const daily_limit = process.env.WP_DAILY_LIMIT;

  if (!(failed_messages && daily_limit)) {
    throw new Error("Failed Messages search Param not found");
  }

  return {
    failed_messages: parseInt(failed_messages),
    daily_limit: parseInt(daily_limit),
  };
}

export default function Success_Message() {
  const { failed_messages, daily_limit } = useLoaderData<{
    failed_messages: number;
    daily_limit: number;
  }>();

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white p-6 rounded shadow-md w-120">
        <div className="block text-gray-700 text-sm font-bold mb-2">
          Successfull Messages:{" "}
          <span className="font-semibold">{daily_limit - failed_messages}</span>
        </div>
        <div className="block text-gray-700 text-sm font-bold mb-2">
          Failed Messages:{" "}
          <span className="font-semibold">{failed_messages}</span>
        </div>
      </div>
    </div>
  );
}
