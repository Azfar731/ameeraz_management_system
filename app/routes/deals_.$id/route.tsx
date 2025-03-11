import { useLoaderData, Link } from "@remix-run/react";
import { DealWithServices } from "~/utils/deal/types";
import { FaEdit, FaLongArrowAltLeft } from "react-icons/fa";
import { LoaderFunctionArgs } from "@remix-run/node";
import { formatDate } from "shared/utilityFunctions";
import { getDealFromId } from "~/utils/deal/db.server";
import { authenticate } from "~/utils/auth/functions.server";

export async function loader({request, params }: LoaderFunctionArgs) {
  await authenticate({request, requiredClearanceLevel: 1 });
  const { id } = params;
  if (!id) {
    throw new Response("Id not provided in the URL", {
      status: 400,
      statusText: "Bad Request: Missing ID parameter",
    });
  }
  const deal = await getDealFromId({ id, includeServices: true });
  if (!deal) {
    throw new Response(`No deal with id: ${id} found`, {
      status: 404,
      statusText: "Not Found",
    });
  }
  return { deal };
}

export default function View_Deal() {
  const { deal } = useLoaderData<{ deal: DealWithServices }>();

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 relative">
      <Link
        to="/deals"
        className="bg-green-400 text-white font-semibold py-2 px-4 absolute top-4 left-4 rounded-lg hover:bg-green-500 flex items-center justify-around gap-2"
      >
        <FaLongArrowAltLeft className="" />
        Go to Deals
      </Link>
      <div className="bg-white mt-14 p-8 rounded-lg shadow-md w-1/2 grid grid-cols-2 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 col-span-2 ">
          Deal Details
        </h1>
        <h3 className="font-medium text-gray-700">Name</h3>
        <h3 className="text-gray-600">{deal.deal_name}</h3>

        <h3 className="font-medium text-gray-700">Price</h3>
        <h3 className="text-gray-600">{deal.deal_price}</h3>

        <h3 className="font-medium text-gray-700">Created at</h3>
        <h3 className="text-gray-600">{formatDate(deal.created_at)}</h3>

        <h3 className="font-medium text-gray-700">Active From</h3>
        <h3 className="text-gray-600">{formatDate(deal.activate_from)}</h3>

        <h3 className="font-medium text-gray-700">Active till</h3>
        <h3 className="text-gray-600">
          {deal.activate_till ? formatDate(deal.activate_till) : "NA"}
        </h3>

        <h3 className="font-medium text-gray-700">Services</h3>
        <h3 className="text-gray-600">
          {deal.services.map((serv) => serv.serv_name).join(", ")}
        </h3>

        <Link
          to={`update`}
          className="mt-6 w-1/3 bg-blue-500 hover:bg-blue-700 flex items-center justify-around text-white  font-bold py-2 px-4 rounded"
        >
          Edit <FaEdit />
        </Link>
      </div>
    </div>
  );
}
