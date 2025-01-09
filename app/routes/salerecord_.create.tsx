import { useState } from "react";
import { Outlet } from "@remix-run/react";
import { FormType } from "~/utils/types";
import { authenticate } from "~/utils/auth/functions.server";
import { LoaderFunctionArgs } from "@remix-run/node";


export async function loader({request}: LoaderFunctionArgs){
  await authenticate({request, requiredClearanceLevel: 1})
  return null
}



export default function SaleRecord() {
  const [formData, setFormData] = useState<FormType>({
    amount_charged: 0,
    amount_paid: 0,
    mobile_num: "",
    deals: [],
    services: [],
    employees: [],
    mode_of_payment: { value: "cash", label: "Cash" },
  });

  return (
    <>
      <Outlet context={{ formData, setFormData }} />
    </>
  );
}
