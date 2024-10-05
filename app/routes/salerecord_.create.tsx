import { useState } from "react";
import { Outlet } from "@remix-run/react";
import { MetaFunction } from "@remix-run/node";
export const meta: MetaFunction = () => {
  return [
    { title: "Form part1" },
    { name: "form part1", content: "This is the sales page of ameeraz" },
  ];
};

type FormType = {
  total_amount: number | undefined
  amount_paid: number | undefined
  mobile_num: string | undefined
  deals: string[] 
  employees: {id: string, work_share: number}[] 
  mode_of_payment: "Cash" | "Bank Transfer" | "Card"

}


export default function SaleRecord() {
  const [formData,setFormData] = useState<FormType>({
    total_amount: undefined,
    amount_paid: undefined,
    mobile_num: undefined,
    deals: [],
    employees: [],
    mode_of_payment: "Cash"
  })

  return (
    <>
      <Outlet context={{formData,setFormData}}/>
    </>
  );
}
