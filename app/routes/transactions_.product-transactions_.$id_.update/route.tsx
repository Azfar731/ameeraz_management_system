import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { replace, useActionData, useLoaderData } from "@remix-run/react";
import ProductTransactionForm from "~/components/productTransactions/ProductTransactionsForm";
import {
    getProductTransactionFromId,
    getProductTransactionWithRelationsFromId,
    updateProductTransaction,
} from "~/utils/productTransaction/db.server";
import { getProductSaleRecordPendingAmount } from "~/utils/productTransaction/functions.server";
import {
    ProductTransactionErrorData,
    ProductTransactionWithRelations,
} from "~/utils/productTransaction/types";
import { productTransactionSchema } from "~/utils/productTransaction/validation.server";
export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  if (!id) {
    throw new Error("No ID provided in the URL");
  }
  const transaction = await getProductTransactionWithRelationsFromId(id);
  if (!transaction) throw new Error(`No transaction with id: ${id} exists`);

  return { transaction };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { id } = params;
  if (!id) {
    throw new Error("No ID provided in the URL");
  }
  const transaction = await getProductTransactionFromId(id);
  if (!transaction) throw new Error(`No transaction with id: ${id} exists`);
  const formData = await request.formData();
  const formValues = Object.fromEntries(formData.entries());
  const new_remaining_amount =
    (await getProductSaleRecordPendingAmount(transaction.record_id)) +
    transaction.amount_paid;

  const validationResult =
    productTransactionSchema(new_remaining_amount).safeParse(formValues);
  if (!validationResult.success) {
    return { errorMessages: validationResult.error.flatten().fieldErrors };
  }
  const updated_transaction = await updateProductTransaction({
    id,
    ...validationResult.data,
    new_remaining_amount,
  });

  throw replace(
    `/transactions/product-transactions/${updated_transaction.product_trans_id}`
  );
}

export default function Product_transaction_update() {
  const { transaction } = useLoaderData<{
    transaction: ProductTransactionWithRelations;
  }>();

  const actionData = useActionData<{
    errorMessages: ProductTransactionErrorData;
  }>();
  return (
    <div className="flex justify-center items-center h-screen">
      <ProductTransactionForm
        product_sale_record={transaction.record}
        transaction={transaction}
        errorMessages={actionData?.errorMessages}
      />
    </div>
  );
}
