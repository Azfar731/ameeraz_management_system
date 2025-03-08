import { User } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { FaEdit, FaLongArrowAltLeft } from "react-icons/fa";
import { formatDate } from "shared/utilityFunctions";
import { getUserFromId } from "~/utils/user/db.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  if (!id) {
    throw new Response("No Id found in URL", {
      status: 400,
      statusText: "Bad Request",
    });
  }
  const user = await getUserFromId(id);
  if (!user) {
    throw new Response(`No user found with id ${id}`, {
      status: 404,
      statusText: "Not Found",
    });
  }
  return { user };
}

export default function User_Details() {
  const { user } = useLoaderData<{ user: User }>();

  return (
    <div className="flex flex-col justify-center items-center relative">
      <Link
        to="/dashboard/users"
        className="bg-green-400 text-white font-semibold py-2 px-4 absolute top-4 left-4 rounded-lg hover:bg-green-500 flex items-center justify-around gap-2"
      >
        <FaLongArrowAltLeft className="" />
        Go Back
      </Link>
      <div className="bg-white mt-14 p-8 rounded-lg shadow-md w-1/2 grid grid-cols-2 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 col-span-2 ">
          User Details
        </h1>
        <h3 className="font-medium text-gray-700">UserName</h3>
        <h3 className="text-gray-600">{user.userName}</h3>
        <h3 className="font-medium text-gray-700">First Name</h3>
        <h3 className="text-gray-600">{user.fname}</h3>
        <h3 className="font-medium text-gray-700">Last Name</h3>
        <h3 className="text-gray-600">{user.lname}</h3>

        <h3 className="font-medium text-gray-700">Role</h3>
        <h3 className="text-gray-600">{user.role}</h3>
        <h3 className="font-medium text-gray-700">Account Status</h3>
        <h3 className="text-gray-600">{user.account_status}</h3>
        <h3 className="font-medium text-gray-700">Created On</h3>
        <h3 className="text-gray-600">{formatDate(user.created_at)}</h3>
        <h3 className="font-medium text-gray-700">Modified At</h3>
        <h3 className="text-gray-600">{formatDate(user.modified_at)}</h3>
        <Link
          to={`update`}
          className="mt-6 w-2/4 bg-blue-500 hover:bg-blue-700 flex items-center justify-around text-white  font-bold py-2 px-4 rounded"
        >
          Edit <FaEdit />
        </Link>
      </div>
    </div>
  );
}
