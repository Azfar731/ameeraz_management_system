import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { ServiceWithRelations } from "~/utils/service/types";
import { FaEdit, FaLongArrowAltLeft } from "react-icons/fa";
import { getServiceFromId } from "~/utils/service/db.server";
import { authenticate } from "~/utils/auth/functions.server";
export async function loader({ request,params }: LoaderFunctionArgs) {
  await authenticate({request, requiredClearanceLevel: 1 });

  const { id } = params;
  if (!id) {
    throw new Response("Id not provided in the URL", {
      status: 400,
      statusText: "Bad Request",
    });
  }
  const service = await getServiceFromId({ id, includeCategory: true });
  if (!service) {
    throw new Response(`No service found with id: ${id}`, {
      status: 404,
      statusText: "Not Found",
    });
  }
  return { service };
}

export default function View_Service() {
  const { service } = useLoaderData<{ service: ServiceWithRelations }>();
  console.log(service);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 relative">
      <Link
        to="/services"
        className="bg-green-400 text-white font-semibold py-2 px-4 absolute top-4 left-4 rounded-lg hover:bg-green-500 flex items-center justify-around gap-2"
      >
        <FaLongArrowAltLeft className="" />
        Go to Services
      </Link>
      <div className="bg-white mt-14 p-8 rounded-lg shadow-md w-1/2 grid grid-cols-2 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 col-span-2 ">
          Service Details
        </h1>
        <h3 className="font-medium text-gray-700">Name</h3>
        <h3 className="text-gray-600">{service.serv_name}</h3>

        <h3 className="font-medium text-gray-700">Price</h3>
        <h3 className="text-gray-600">{service.serv_price}</h3>

        <h3 className="font-medium text-gray-700">Category</h3>
        <h3 className="text-gray-600">{service.category.cat_name}</h3>

        <h3 className="font-medium text-gray-700">Status</h3>
        <h3 className="text-gray-600">
          {service.deals[0].activate_till ? "InActive" : "Active"}
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
