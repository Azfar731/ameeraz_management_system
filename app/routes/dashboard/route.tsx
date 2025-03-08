import { Outlet, Link } from "@remix-run/react";
const DashboardLayout = () => {
  return (
    <div className="flex flex-1 p-4 gap-4 bg-gray-200">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white  p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Dashboard</h2>
        <nav>
          <ul>
            <li className="mb-2"><Link to={`whatsapp`} className="hover:text-gray-300">Whatsapp</Link></li>
            <li className="mb-2"><Link to={`users`} className="hover:text-gray-300">Users</Link></li>
            
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
