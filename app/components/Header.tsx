import { Form, Link } from "@remix-run/react";
import { useState } from "react";
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
        <Form action="/logout" method="post" className="text-lg">
          <button  type="submit">Logout</button>
        </Form>
      </div>

      {/* Navigation component */}
      {isNavOpen && <Nav closeNav={toggleNav} />}
    </header>
  );
};

export default Header;
