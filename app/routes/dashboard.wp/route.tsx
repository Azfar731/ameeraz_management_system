
import { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, NavLink } from "@remix-run/react";
import { authenticate } from "~/utils/auth/functions.server";


export async function loader({request}: LoaderFunctionArgs){
  await authenticate({request, requiredClearanceLevel: 3 });
  return null;
}

export default function Whatsapp() {
  return (
    <div className="m-1">
      <div className="w-full flex justify-center items-center ">
        <h1 className=" font-semibold text-6xl text-gray-700">WhatsApp Functions</h1>
      </div>
      <div className="flex justify-center items-center bg-gray-100 p-4 mt-6 shadow-md w-fit mx-auto rounded-full">
        <NavLink
          to="sendMessages"
          className={({ isActive }) =>
            `text-lg px-4 py-2 rounded-full transition-colors ${
              isActive
          ? "text-white bg-blue-500 font-bold"
          : "text-gray-600 hover:bg-blue-100 hover:text-blue-600"
            }`
          }
          end
        >
          Send Messages
        </NavLink>
        <NavLink
          to="uploadMedia"
          className={({ isActive }) =>
            `text-lg px-4 py-2 rounded-full transition-colors ${
              isActive
                ? "text-white bg-blue-500 font-bold"
                : "text-gray-600 hover:bg-blue-100 hover:text-blue-600"
            }`
          }
        >
          Upload Media
        </NavLink>
        <NavLink
          to="templates"
          className={({ isActive }) =>
            `text-lg px-4 py-2 rounded-full transition-colors ${
              isActive
                ? "text-white bg-blue-500 font-bold"
                : "text-gray-600 hover:bg-blue-100 hover:text-blue-600"
            }`
          }
        >
          Manage Templates
        </NavLink>
        <NavLink
          to="failedMessages"
          className={({ isActive }) =>
            `text-lg px-4 py-2 rounded-full transition-colors ${
              isActive
                ? "text-white bg-blue-500 font-bold"
                : "text-gray-600 hover:bg-blue-100 hover:text-blue-600"
            }`
          }
        >
          Check Errors
        </NavLink>
      </div>
      <Outlet />
    </div>
  );
}
