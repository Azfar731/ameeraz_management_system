import { Product } from "@prisma/client";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { replace, useActionData, useLoaderData } from "@remix-run/react";
import { printZodErrors } from "~/utils/functions.server";
import { getAllProducts } from "~/utils/products/db.server";
import {
  getProductSaleRecordByIdWithRelations,
  updateProductSaleRecord,
} from "~/utils/productSaleRecord/db.server";
import {
  ProductSaleRecordUpdateErrors,
  ProductSaleRecordWithRelations,
} from "~/utils/productSaleRecord/types";
import { ProductSaleRecordUpdateSchema } from "~/utils/productSaleRecord/validation.server";
import Product_Sale_Record_Form from "./product_Sale_Record_Form";
import { authenticate } from "~/utils/auth/functions.server";
import { createLog } from "~/utils/logs/db.server";
export async function loader({ request, params }: LoaderFunctionArgs) {
  await authenticate({ request, requiredClearanceLevel: 3 });

  const { id } = params;
  if (!id) {
    throw new Response("ID not provided in the URL", {
      status: 400,
      statusText: "Bad Request",
    });
  }
  const productSaleRecord = await getProductSaleRecordByIdWithRelations({
    id,
  });
  if (!productSaleRecord) {
    throw new Response("Product sale record not found", {
      status: 404,
      statusText: "Not Found",
    });
  }
  const products = await getAllProducts();
  return { productSaleRecord, products };
}

type ActionDataObject = {
  mobile_num: string;
  transaction_type: string;
  total_amount: string;
  products_quantity: {
    product_id: string;
    quantity: number;
  }[];
  isClient: boolean;
};

export async function action({ request, params }: ActionFunctionArgs) {
  const userId = await authenticate({ request, requiredClearanceLevel: 3 });

  const { id } = params;
  if (!id) {
    throw new Response("ID not provided in the URL", {
      status: 400,
      statusText: "Bad Request",
    });
  }
  const oldProductSaleRecord = await getProductSaleRecordByIdWithRelations({
    id,
  });
  if (!oldProductSaleRecord) {
    throw new Response("Product sale record not found", {
      status: 404,
      statusText: "Not Found",
    });
  }
  const data = (await request.json()) as ActionDataObject;
  console.log("Data", data);

  const validationResult = await ProductSaleRecordUpdateSchema(
    oldProductSaleRecord
  ).safeParseAsync({ ...data, id });
  if (!validationResult.success) {
    console.log("New errors found");
    const errors = validationResult.error.flatten().fieldErrors;
    printZodErrors(errors);
    return { errors };
  }

  //update the product sale record
  await updateProductSaleRecord({
    ...validationResult.data,
    id,
    oldProductSaleRecord,
  });
  await createLog({
    userId,
    log_type: "update",
    log_message: `updated Product. Link: /products-sale-record/${id}}`,
  });
  throw replace(`/products-sale-record/${id}`);
}

export default function Update_Product_Sale_Record() {
  const { productSaleRecord, products } = useLoaderData<{
    productSaleRecord: Omit<ProductSaleRecordWithRelations, "transactions">;
    products: Product[];
  }>();
  const actionData = useActionData<{ errors: ProductSaleRecordUpdateErrors }>();

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Product_Sale_Record_Form
        products={products}
        record={productSaleRecord}
        errorMessages={actionData?.errors}
      />
    </div>
  );
}
