import { Outlet, Link, NavLink } from "@remix-run/react";
const DashboardLayout = () => {
  return (
    <div className="flex flex-1 p-4 gap-4 bg-gray-200">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white  p-4 rounded-lg">
        <div className="w-full text-center">
          <h2 className="text-3xl text-blue-200 font-bold mb-4">Dashboard</h2>
        </div>
        <nav>
          <ul>
            <li className="mb-2">
              <NavLink
                to={`wp`}
                className={({ isActive }) =>
                  isActive ? "underline font-bold text-blue-300 text-xl" : "hover:underline hover:text-gray-300 text-xl font-semibold"
                }
                
              >
                Whatsapp
              </NavLink>
            </li>
            <li className="mb-2">
              <NavLink
                to={`users`}
                className={({ isActive }) =>
                  isActive ? "underline font-bold text-blue-300 text-xl" : "hover:underline hover:text-gray-300 text-xl font-semibold"
                }
              >
                Users
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>
      {/* Main content */}
      <main className="flex-1 rounded-lg p-6 bg-gray-50 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
