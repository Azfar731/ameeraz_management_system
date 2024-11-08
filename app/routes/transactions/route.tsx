import { Outlet, NavLink } from "@remix-run/react";
export default function Transactions() {
  return (
    <div className="m-8">
      <div className="w-full flex justify-center items-center ">
        <h1 className=" font-semibold text-6xl text-gray-700">Transactions</h1>
      </div>
      <div className="flex justify-center items-center bg-gray-100 p-4 mt-6 shadow-md w-fit mx-auto rounded-full">
        <NavLink
          to="clientTransactions"
          className={({ isActive }) =>
            `text-lg px-4 py-2 rounded-full transition-colors ${
              isActive
                ? "text-white bg-blue-500 font-bold"
                : "text-gray-600 hover:bg-blue-100 hover:text-blue-600"
            }`
          }
        >
          Client Transactions
        </NavLink>
        <NavLink
          to="productTransctions"
          className={({ isActive }) =>
            `text-lg px-4 py-2 rounded-full transition-colors ${
              isActive
                ? "text-white bg-blue-500 font-bold"
                : "text-gray-600 hover:bg-blue-100 hover:text-blue-600"
            }`
          }
        >
          Product Transactions
        </NavLink>
        <NavLink
          to="operationalTransactions"
          className={({ isActive }) =>
            `text-lg px-4 py-2 rounded-full transition-colors ${
              isActive
                ? "text-white bg-blue-500 font-bold"
                : "text-gray-600 hover:bg-blue-100 hover:text-blue-600"
            }`
          }
        >
          Operational Expenses
        </NavLink>
        <NavLink
          to="all"
          className={({ isActive }) =>
            `text-lg px-4 py-2 rounded-full transition-colors ${
              isActive
                ? "text-white bg-blue-500 font-bold"
                : "text-gray-600 hover:bg-blue-100 hover:text-blue-600"
            }`
          }
        >
          All
        </NavLink>
      </div>
      <Outlet />
    </div>
  );
}
