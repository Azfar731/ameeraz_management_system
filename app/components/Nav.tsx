import { Link } from '@remix-run/react';

interface NavProps {
  closeNav: () => void;
}

const Nav: React.FC<NavProps> = ({ closeNav }) => {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 z-50 flex">
      {/* Sidebar navigation taking up 1/3 of the screen */}
      <div className="w-1/3 bg-gray-800 h-full flex flex-col text-white p-6">
        <button
          className="absolute top-4 right-4 text-3xl"
          onClick={closeNav}
        >
          &times;
        </button>

        <nav className="text-2xl flex flex-col justify-start gap-4">
          <Link to="/" className="hover:underline" onClick={closeNav}>
            Home
          </Link>
          <Link to="/about" className="hover:underline" onClick={closeNav}>
            About
          </Link>
          <Link to="/services" className="hover:underline" onClick={closeNav}>
            Services
          </Link>
          <Link to="/contact" className="hover:underline" onClick={closeNav}>
            Contact
          </Link>
        </nav>
      </div>

      {/* Remaining 2/3 of the screen is transparent and clickable to close the nav */}
      <div className="w-2/3 h-full" onClick={closeNav}></div>
    </div>
  );
};

export default Nav;
