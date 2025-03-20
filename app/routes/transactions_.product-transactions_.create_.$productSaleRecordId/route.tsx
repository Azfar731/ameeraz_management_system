import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { replace, useActionData, useLoaderData } from "@remix-run/react";
import ProductTransactionForm from "~/components/productTransactions/ProductTransactionsForm";
import { authenticate } from "~/utils/auth/functions.server";
import { createLog } from "~/utils/logs/db.server";
import { getProductSaleRecordByIdWithRelations } from "~/utils/productSaleRecord/db.server";
import { ProductSaleRecordWithRelations } from "~/utils/productSaleRecord/types";
import { createProductTransaction } from "~/utils/productTransaction/db.server";
import { getProductSaleRecordPendingAmount } from "~/utils/productTransaction/functions.server";
import { ProductTransactionErrorData } from "~/utils/productTransaction/types";
import { productTransactionSchema } from "~/utils/productTransaction/validation.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await authenticate({ request, requiredClearanceLevel: 2 });
  const { productSaleRecordId } = params;
  if (!productSaleRecordId) {
    throw new Response("NO ID provided in the URL", {
      status: 400,
      statusText: "Bad Request",
    });
  }
  const product_sale_record = await getProductSaleRecordByIdWithRelations({
    id: productSaleRecordId,
  });
  if (!product_sale_record) {
    throw new Response(
      `No product sale record with id: ${productSaleRecordId} exists`,
      {
        status: 404,
        statusText: "Not Found",
      }
    );
  }
  return { product_sale_record };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const userId = await authenticate({ request, requiredClearanceLevel: 2 });

  const { productSaleRecordId } = params;
  if (!productSaleRecordId) {
    throw new Response("NO ID provided in the URL", {
      status: 400,
      statusText: "Bad Request",
    });
  }
  const formData = await request.formData();
  const formValues = Object.fromEntries(formData.entries());
  const maxAmount = await getProductSaleRecordPendingAmount(
    productSaleRecordId
  );
  const validationResult =
    productTransactionSchema(maxAmount).safeParse(formValues);
  if (!validationResult.success) {
    return { errorMessages: validationResult.error.flatten().fieldErrors };
  }
  const new_transaction = await createProductTransaction({
    ...validationResult.data,
    product_record_id: productSaleRecordId,
  });
  await createLog({
    userId,
    log_type: "create",
    log_message: `Created Product Transaction. Link: /transactions/product-transactions/${new_transaction.product_trans_id}`,
  });
  throw replace(
    `/transactions/product-transactions/${new_transaction.product_trans_id}`
  );
}

export default function Product_transaction_create_part2() {
  const { product_sale_record } = useLoaderData<{
    product_sale_record: ProductSaleRecordWithRelations;
  }>();

  const actionData = useActionData<{
    errorMessages: ProductTransactionErrorData;
  }>();
  return (
    <div className="flex justify-center items-center min-h-screen">
      <ProductTransactionForm
        product_sale_record={product_sale_record}
        errorMessages={actionData?.errorMessages}
      />
    </div>
  );
}
