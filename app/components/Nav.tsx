import { NavLink } from "@remix-run/react";

interface NavProps {
  closeNav: () => void;
}

const Nav: React.FC<NavProps> = ({ closeNav }: { closeNav: () => void }) => {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 z-50 flex">
      {/* Sidebar navigation taking up 1/3 of the screen */}
      <div className="w-1/3 bg-gray-800 h-full flex flex-col text-white p-6">
        <button className="absolute top-4 right-4 text-3xl" onClick={closeNav}>
          &times;
        </button>

        <nav className="text-2xl flex flex-col justify-start gap-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "underline font-bold text-pink-500" : "hover:underline"
            }
            onClick={closeNav}
          >
            Sale Records
          </NavLink>
          <NavLink
            to="/clients"
            className={({ isActive }) =>
              isActive ? "underline font-bold text-pink-500" : "hover:underline"
            }
            onClick={closeNav}
          >
            Clients
          </NavLink>
          <NavLink
            to="/services"
            className={({ isActive }) =>
              isActive ? "underline font-bold text-pink-500" : "hover:underline"
            }
            onClick={closeNav}
          >
            Services
          </NavLink>
          <NavLink
            to="/deals"
            className={({ isActive }) =>
              isActive ? "underline font-bold text-pink-500" : "hover:underline"
            }
            onClick={closeNav}
          >
            Deals
          </NavLink>
          <NavLink
            to="/categories"
            className={({ isActive }) =>
              isActive ? "underline font-bold text-pink-500" : "hover:underline"
            }
            onClick={closeNav}
          >
            Categories
          </NavLink>
          <NavLink
            to="/employees"
            className={({ isActive }) =>
              isActive ? "underline font-bold text-pink-500" : "hover:underline"
            }
            onClick={closeNav}
          >
            Employees
          </NavLink>
          <NavLink
            to="/transactions"
            className={({ isActive }) =>
              isActive ? "underline font-bold text-pink-500" : "hover:underline"
            }
            onClick={closeNav}
          >
            Transactions
          </NavLink>
          <NavLink
            to="/products"
            className={({ isActive }) =>
              isActive ? "underline font-bold text-pink-500" : "hover:underline"
            }
            onClick={closeNav}
          >
            Products
          </NavLink>
          <NavLink
            to="/vendors"
            className={({ isActive }) =>
              isActive ? "underline font-bold text-pink-500" : "hover:underline"
            }
            onClick={closeNav}
          >
            Vendors
          </NavLink>
        </nav>
      </div>

      {/* Remaining 2/3 of the screen is transparent and clickable to close the nav */}
      <div className="w-2/3 h-full" onClick={closeNav}></div>
    </div>
  );
};

export default Nav;
