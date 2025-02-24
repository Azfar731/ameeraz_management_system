import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link, useLocation } from "@remix-run/react";
import { ClientWithRelations } from "~/utils/client/types";
import { FaEdit, FaLongArrowAltLeft } from "react-icons/fa";
import { getClientFromId } from "~/utils/client/db.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  if (!id) {
    throw new Response("Id not provided in URL", {
      status: 400,
      statusText: "Bad Request: Missing ID parameter",
    });
  }
  const client = await getClientFromId({ id, includeServices: true });
  if (!client) {
    throw new Response(`Client with id:${id} not found`, {
      status: 404,
      statusText: "Not Found",
    });
  }
  return { client };
}

export default function View_Client() {
  const { client } = useLoaderData<{ client: ClientWithRelations }>();
  const location = useLocation();
  const getLocationState = () => {
    const { sp_areas, sp_fname, sp_lname, sp_mobile_num } =
      location.state || {};
    const searchParamValues = {
      fname: sp_fname,
      lname: sp_lname,
      areas: sp_areas,
      mobile_num: sp_mobile_num,
    };
    let searchquery = "?";
    for (const [key, value] of Object.entries(searchParamValues)) {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          // Join array values with commas and append
          searchquery += `${key}=${value.join("|")}&`;
        }
      } else if (value) {
        // Append non-empty string values
        searchquery += `${key}=${value}&`;
      }
    }
    return searchquery.slice(0, -1);
  };

  const total_amount_spent = client.services.reduce((sum, service) => {
    return sum + service.total_amount;
  }, 0);
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 relative">
      <Link
        to={{ pathname: `/clients`, search: getLocationState() }}
        className="bg-green-400 text-white font-semibold py-2 px-4 absolute top-4 left-4 rounded-lg hover:bg-green-500 flex items-center justify-around gap-2"
      >
        <FaLongArrowAltLeft className="" />
        Go to Clients
      </Link>
      <div className="bg-white mt-14 p-8 rounded-lg shadow-md w-1/2 grid grid-cols-2 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 col-span-2 ">
          Client Details
        </h1>
        <h3 className="font-medium text-gray-700">First Name</h3>
        <h3 className="text-gray-600">{client.client_fname}</h3>

        <h3 className="font-medium text-gray-700">Last Name</h3>
        <h3 className="text-gray-600">{client.client_lname}</h3>

        <h3 className="font-medium text-gray-700">Mobile Number</h3>
        <h3 className="text-gray-600">{client.client_mobile_num}</h3>

        <h3 className="font-medium text-gray-700">Area</h3>
        <h3 className="text-gray-600">{client.client_area}</h3>

        <h3 className="font-medium text-gray-700">Number of Vists</h3>
        <h3 className="text-gray-600">{client.services.length}</h3>

        <h3 className="font-medium text-gray-700">Total Amount Spent</h3>
        <h3 className="text-gray-600">{total_amount_spent}</h3>

        <h3 className="font-medium text-gray-700">Subscribed to Promotions</h3>
        <h3 className="text-gray-600">
          {client.subscribed === "true" ? "Yes" : "No"}
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
