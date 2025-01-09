import { Link } from "@remix-run/react";

export default function UnAuthorized() {
  return (
    <>
      <h2>You are not authorized to access this page</h2>
      <Link to="/">Go Back to Home</Link>
    </>
  );
}
