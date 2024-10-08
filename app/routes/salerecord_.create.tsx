import { useState } from "react";
import { Outlet } from "@remix-run/react";
import { MetaFunction } from "@remix-run/node";
import { FormType

 } from "~/utils/types";
export const meta: MetaFunction = () => {
  return [
    { title: "Form part1" },
    { name: "form part1", content: "This is the sales page of ameeraz" },
  ];
};



export default function SaleRecord() {
  const [formData,setFormData] = useState<FormType>({
    amount_charged: 0,
    amount_paid: 0,
    mobile_num: "",
    deals: [],
    services: [],
    employees: [],
    mode_of_payment: {value: "cash", label: "Cash"}
  })

  return (
    <>
      <Outlet context={{formData,setFormData}}/>
    </>
  );
}
