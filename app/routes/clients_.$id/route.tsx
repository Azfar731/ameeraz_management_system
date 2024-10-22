import { Outlet } from "@remix-run/react";

export default function View_Client() {
  return (
    <>
      <h1>This is the view for a single client</h1>
      <Outlet />
    </>
  );
}
