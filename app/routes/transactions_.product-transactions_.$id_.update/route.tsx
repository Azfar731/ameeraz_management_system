import { LoaderFunctionArgs } from "@remix-run/node";
import { getProductTransactionWithRelationsFromId } from "~/utils/productTransaction/db.server";
export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  if (!id) {
    throw new Error("No ID provided in the URL");
  }
  const transaction = await getProductTransactionWithRelationsFromId(id);
  if (!transaction) throw new Error(`No transaction with id: ${id} exists`);

  return { transaction };
}


