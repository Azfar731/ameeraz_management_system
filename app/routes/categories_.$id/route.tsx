import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { CategoryWithServices } from "~/utils/category/types";
import { FaEdit, FaLongArrowAltLeft } from "react-icons/fa";
import { getCategoryFromId } from "~/utils/category/db.server";
import { authenticate } from "~/utils/auth/functions.server";
export async function loader({request, params }: LoaderFunctionArgs) {

  await authenticate({request, requiredClearanceLevel: 1 });

  const { id } = params;
  if (!id) {
    throw new Response("Id not provided in the url", {
      status: 400,
      statusText: "Bad Request: Missing ID parameter",
    });
  }
  const category = await getCategoryFromId({ id, include_services: true });
  if (!category) {
    throw new Response(`No category found with id: ${id}`, {
      status: 404,
      statusText: "Not Found",
    });
  }
  return { category };
}

export default function View_Category() {
  const { category } = useLoaderData<{ category: CategoryWithServices }>();

  //   const services = category.services

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 relative">
      <Link
        to="/categories"
        className="bg-green-400 text-white font-semibold py-2 px-4 absolute top-4 left-4 rounded-lg hover:bg-green-500 flex items-center justify-around gap-2"
      >
        <FaLongArrowAltLeft className="" />
        Go to Categories
      </Link>
      <div className="bg-white mt-14 p-8 rounded-lg shadow-md w-1/2 grid grid-cols-2 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 col-span-2 ">
          Category Details
        </h1>
        <h3 className="font-medium text-gray-700">Name</h3>
        <h3 className="text-gray-600">{category.cat_name}</h3>

        <h3 className="font-medium text-gray-700">Attached Services</h3>
        <h3>{category.services.map(service => service.serv_name).join(",")}</h3>
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
