import { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, NavLink } from "@remix-run/react";
import { authenticate } from "~/utils/auth/functions.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate({ request, requiredClearanceLevel: 3 });

  return null;
}

export default function Transactions() {
  return (
    <div className="m-4">
      <div className="w-full flex justify-center items-center ">
        <h1 className=" font-semibold text-6xl text-gray-700">Insights</h1>
      </div>
      <div className="flex justify-center items-center bg-gray-100 p-4 mt-6 shadow-md w-fit mx-auto rounded-full">
        <NavLink
          to="/dashboard/insights"
          className={({ isActive }) =>
            `text-lg px-4 py-2 rounded-full transition-colors ${
              isActive
                ? "text-white bg-blue-500 font-bold"
                : "text-gray-600 hover:bg-blue-100 hover:text-blue-600"
            }`
          }
          end
        >
          Clients
        </NavLink>
        <NavLink
          to="deals"
          className={({ isActive }) =>
            `text-lg px-4 py-2 rounded-full transition-colors ${
              isActive
                ? "text-white bg-blue-500 font-bold"
                : "text-gray-600 hover:bg-blue-100 hover:text-blue-600"
            }`
          }
        >
          Deal
        </NavLink>
        <NavLink
          to="services"
          className={({ isActive }) =>
            `text-lg px-4 py-2 rounded-full transition-colors ${
              isActive
                ? "text-white bg-blue-500 font-bold"
                : "text-gray-600 hover:bg-blue-100 hover:text-blue-600"
            }`
          }
        >
          Services
        </NavLink>
        <NavLink
          to="sales"
          className={({ isActive }) =>
            `text-lg px-4 py-2 rounded-full transition-colors ${
              isActive
                ? "text-white bg-blue-500 font-bold"
                : "text-gray-600 hover:bg-blue-100 hover:text-blue-600"
            }`
          }
        >
          Sales
        </NavLink>
      </div>
      <Outlet />
    </div>
  );
}
