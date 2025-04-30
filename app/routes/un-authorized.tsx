import { Link } from "@remix-run/react";

export default function UnAuthorized() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h2 className=" text-3xl">You are not authorized to access this page</h2>
      <div className="px-4 py-2 mt-4 bg-red-500 rounded shadow-md text-white">
        <Link to="/" >Go Back to Home</Link>
      </div>
    </div>
  );
}
