import { SerializeFrom } from "@remix-run/node";
import { BalanceTransactionWithRelations } from "./types";


const calculateBalanceTransaction = (transactions: SerializeFrom<BalanceTransactionWithRelations>[]) => {
  const balanceAdded = transactions
    .filter(tx => tx.type === "added")
    .reduce((acc, tx) => acc + tx.amount, 0);

  const balanceSubtracted = transactions
    .filter(tx => tx.type === "subtracted")
    .reduce((acc, tx) => acc + tx.amount, 0);

  return {
    balanceAdded,
    balanceSubtracted,
   
  };
}

export { calculateBalanceTransaction}