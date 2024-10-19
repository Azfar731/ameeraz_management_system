import { useState } from "react";
import { Outlet } from "@remix-run/react";
import { FormType } from "~/utils/types";

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
