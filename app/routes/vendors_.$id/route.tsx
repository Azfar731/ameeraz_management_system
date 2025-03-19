import { Vendor } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useNavigation } from "@remix-run/react";
import { FaEdit, FaLongArrowAltLeft } from "react-icons/fa";
import { authenticate } from "~/utils/auth/functions.server";
import { getVendorFromId } from "~/utils/vendors/db.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await authenticate({ request, requiredClearanceLevel: 1 });
  const { id } = params;
  if (!id) {
    throw new Response("Id not provided in URL", {
      status: 400,
      statusText: "Bad Request",
    });
  }
  const vendor = await getVendorFromId({ id });
  if (!vendor) {
    throw new Response(`Vendor with id:${id} not found`, {
      status: 404,
      statusText: "Not Found",
    });
  }
  return { vendor };
}

export default function View_Vendor() {
  const { vendor } = useLoaderData<{ vendor: Vendor }>();
  const navigation = useNavigation();
  const isNavigating =
    navigation.state === "loading" || navigation.state === "submitting";

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 relative">
      <Link
        to={"/vendors"}
        className="bg-green-400 text-white font-semibold py-2 px-4 absolute top-4 left-4 rounded-lg hover:bg-green-500 flex items-center justify-around gap-2"
      >
        <FaLongArrowAltLeft className="" />
        Go to Vendors
      </Link>
      <div className="bg-white mt-14 p-8 rounded-lg shadow-md w-1/2 grid grid-cols-2 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 col-span-2 ">
          Vendor Details
        </h1>
        <h3 className="font-medium text-gray-700">First Name</h3>
        <h3 className="text-gray-600">{vendor.vendor_fname}</h3>

        <h3 className="font-medium text-gray-700">Last Name</h3>
        <h3 className="text-gray-600">{vendor.vendor_lname}</h3>

        <h3 className="font-medium text-gray-700">Mobile Number</h3>
        <h3 className="text-gray-600">{vendor.vendor_mobile_num}</h3>

        <button
          disabled={isNavigating}
          className="mt-6 w-1/3 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Link
            to={`update`}
            className="flex items-center justify-around"
            aria-disabled={isNavigating}
          >
            Edit <FaEdit />
          </Link>
        </button>
      </div>
    </div>
  );
}
