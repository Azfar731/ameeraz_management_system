import { useState } from "react";
import { Outlet } from "@remix-run/react";

import { ProductSaleRecordCreateFormType } from "~/utils/productSaleRecord/types";
import { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/utils/auth/functions.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate({ request, requiredClearanceLevel: 2 });
  return null;
}

export default function Product_Sale_Record_Create() {
  const [formData, setFormData] = useState<ProductSaleRecordCreateFormType>({
    amount_charged: 0,
    amount_paid: 0,
    mobile_num: "",
    transaction_type: "sold",
    products_quantity: [],
    mode_of_payment: "cash",
    isClient: true,
  });

  return (
    <>
      <Outlet context={{ formData, setFormData }} />
    </>
  );
}
