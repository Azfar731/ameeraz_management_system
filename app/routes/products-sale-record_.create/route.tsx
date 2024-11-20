import { useState } from "react";
import { Outlet } from "@remix-run/react";

import { ProductSaleRecordCreateFormType } from "~/utils/productSaleRecord/types";

export default function Product_Sale_Record_Create() {
  const [formData, setFormData] = useState<ProductSaleRecordCreateFormType>({
    amount_charged: 0,
    amount_paid: 0,
    mobile_num: "",
    transaction_type: "sold",
    products: [],
    mode_of_payment: "cash",
  });

  return (
    <>
      <Outlet context={{ formData, setFormData }} />
    </>
  );
}
