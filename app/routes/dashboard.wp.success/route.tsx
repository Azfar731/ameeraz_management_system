import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { FaLongArrowAltLeft } from "react-icons/fa";

export async function loader({ request }: LoaderFunctionArgs) {
  const searchParams = new URL(request.url).searchParams;
  const failed_messages = searchParams.get("failed_messages");
  const total_messages = searchParams.get("total_messages");

  if (!(failed_messages && total_messages)) {
    throw new Error("Failed Messages search Param not found");
  }

  return {
    failed_messages: parseInt(failed_messages),
    total_messages: parseInt(total_messages),
  };
}

export default function Success_Message() {
  const { failed_messages, total_messages } = useLoaderData<{
    failed_messages: number;
    total_messages: number;
  }>();

  return (
    <div className="p-4 flex flex-col justify-center items-center relative h-72">
       <Link
        to={`/dashboard/wp`}
        className="absolute top-4 left-4   bg-green-400 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-500 flex items-center justify-around gap-2"
      >
        <FaLongArrowAltLeft className="" />
        Go Back
      </Link>
      <div className="bg-white p-6 rounded shadow-md w-120">
        <div className="block text-gray-700 text-sm font-bold mb-2">
          Successfull Messages:{" "}
          <span className="font-semibold">
            {total_messages - failed_messages}
          </span>
        </div>
        <div className="block text-gray-700 text-sm font-bold mb-2">
          Failed Messages:{" "}
          <span className="font-semibold">{failed_messages}</span>
        </div>
      </div>
    </div>
  );
}
