import React from "react";
import { Link, useActionData,Outlet } from "@remix-run/react";
import { MetaFunction } from "@remix-run/node";
export const meta: MetaFunction = () => {
  return [
    { title: "Form part1" },
    { name: "form part1", content: "This is the sales page of ameeraz" },
  ];
};


export default function SaleRecord() {
  const data = useActionData();
  if (data){
  console.log(data)
  }
  return (
    <Outlet />
  );
}
