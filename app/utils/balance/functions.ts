import { Client_Transaction, Operational_Expenses } from "@prisma/client";
import { calculateProductTransaction } from "../productTransaction/functions";
import { ProductTransactionWithRelations } from "../productTransaction/types";

const calculateBalanceThroughTransactions = ({
    clientTransactions,
    productTransactions,
    operationalExpenses,
}: {
    clientTransactions: Client_Transaction[];
    productTransactions: ProductTransactionWithRelations[];
    operationalExpenses: Operational_Expenses[];
}) => {

    const { productsBought, productsSold } =
    calculateProductTransaction(productTransactions);

    const clientTransactionsBalance = clientTransactions.reduce((acc, tx) => acc + tx.amount_paid, 0);

    const operationalExpensesBalance = operationalExpenses.reduce((acc, tx) => acc + tx.amount_paid, 0);

    const balance = clientTransactionsBalance + productsSold.cashTransaction - (productsBought.cashTransaction + operationalExpensesBalance);
    return balance;
}

const calculateBalance = (
    {clientTransactionsSum, operationalExpensesSum, productsSoldSum, productsBoughtSum}: {
      clientTransactionsSum: number;
      operationalExpensesSum: number;
      productsSoldSum: number;
      productsBoughtSum: number
    }
) => {
 return clientTransactionsSum + productsSoldSum - (productsBoughtSum + operationalExpensesSum)
}



export { calculateBalanceThroughTransactions, calculateBalance  }