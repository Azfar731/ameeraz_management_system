import { useState } from "react";
import { Link } from "@remix-run/react";
import Nav from "./Nav";
const Header: React.FC = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);

  const toggleNav = () => {
    setIsNavOpen((prev) => !prev);
  };

  return (
    <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
      {/* Hamburger icon */}
      <button className="text-2xl" onClick={toggleNav}>
        &#9776;
      </button>

      {/* Company logo */}
      <div className="text-2xl font-bold">
        <Link to="/">Company Logo</Link>
      </div>

      {/* Login link */}
      <div>
        <Link to="/login" className="text-lg">
          Login
        </Link>
      </div>

      {/* Navigation component */}
      {isNavOpen && <Nav closeNav={toggleNav} />}
    </header>
  );
};

export default Header;
