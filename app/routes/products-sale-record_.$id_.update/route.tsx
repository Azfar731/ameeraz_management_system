import { Product } from "@prisma/client";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { replace, useActionData, useLoaderData } from "@remix-run/react";
import { printZodErrors } from "~/utils/functions.server";
import { getAllProducts } from "~/utils/products/db.server";
import { getProductSaleRecordById, getProductSaleRecordByIdWithRelations, updateProductSaleRecord } from "~/utils/productSaleRecord/db.server";
import {
  ProductSaleRecordUpdateErrors,
  ProductSaleRecordWithRelations,
} from "~/utils/productSaleRecord/types";
import { ProductSaleRecordUpdateSchema } from "~/utils/productSaleRecord/validation.server";
import Product_Sale_Record_Form from "./product_Sale_Record_Form";
export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  if (!id) {
    throw new Error("Product sale record ID is required");
  }
  const productSaleRecord = await getProductSaleRecordByIdWithRelations({
    id
  });
  if (!productSaleRecord) {
    throw new Error("Product sale record not found");
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

export async function action({ request,params }: ActionFunctionArgs) {
  const {id} = params; 
  if(!id){
    throw new Error("Product sale record ID is required");
  }
  const oldProductSaleRecord = await getProductSaleRecordByIdWithRelations({
    id
   
  });
  if (!oldProductSaleRecord) {
    throw new Error("Product sale record not found");
  }
  const data = (await request.json()) as ActionDataObject;
  console.log("Data", data);
  
  const validationResult = await ProductSaleRecordUpdateSchema(oldProductSaleRecord as ProductSaleRecordWithRelations).safeParseAsync({...data,id});
  if (!validationResult.success) {
    console.log("New errors found")
    const errors = validationResult.error.flatten().fieldErrors;
    printZodErrors(errors);
    return { errors };
  }

  //update the product sale record
  await updateProductSaleRecord({...validationResult.data, id, oldProductSaleRecord });

  

  throw replace(`/products-sale-record/${id}`);
}

export default function Update_Product_Sale_Record() {
  const { productSaleRecord, products } = useLoaderData<{
    productSaleRecord: Omit<ProductSaleRecordWithRelations, "transactions">;
    products: Product[];
  }>();
  const actionData = useActionData<{ errors: ProductSaleRecordUpdateErrors }>();
  const { client, products: product_records, vendor } = productSaleRecord;

  return (
    <div className="flex justify-center items-center h-screen">
      <Product_Sale_Record_Form
        products={products}
        record={productSaleRecord}
        errorMessages={actionData?.errors}
      />
    </div>
  );
}
