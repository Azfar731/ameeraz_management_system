import { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/utils/auth/functions.server";
import { NavLink, Outlet } from "@remix-run/react";

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate({ request, requiredClearanceLevel: 3 });
  return null;
  // return { templates, remainingLimit, numOfClientBatches, media };
}

export default function WP_SendMessages() {
  return (
    <div className="mt-8 flex gap-2 w-full h-full ">
      <div className="flex flex-col justify-start w-1/4 bg-gray-100 rounded-lg p-4">
        <div className="w-full text-center">
          <h2 className="text-3xl text-blue-500 font-bold mb-4">Recipients</h2>
        </div>
        <NavLink
          to="."
          className={({ isActive }) =>
            `text-lg px-4 py-2 rounded-full transition-colors ${
              isActive
                ? "text-white bg-blue-500 font-bold"
                : "text-gray-600 hover:bg-blue-100 hover:text-blue-600"
            }`
          }
          end
        >
          Clients List
        </NavLink>
        <NavLink
          to="numbersList"
          className={({ isActive }) =>
            `text-lg px-4 py-2 rounded-full transition-colors ${
              isActive
                ? "text-white bg-blue-500 font-bold"
                : "text-gray-600 hover:bg-blue-100 hover:text-blue-600"
            }`
          }
        >
          Numbers List
        </NavLink>
      </div>
      <div className="flex-grow  rounded-lg">
        <Outlet />
      </div>
    </div>
  );
}
