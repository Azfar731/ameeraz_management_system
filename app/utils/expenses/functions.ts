import { Operational_Expenses } from "@prisma/client";
import { SerializeFrom } from "@remix-run/node";


const calculateTotalExpenses = (transactions: SerializeFrom<Operational_Expenses>[] | Operational_Expenses[]) => {
    return transactions.reduce((acc, curr) => acc + curr.amount_paid, 0);
}

export { calculateTotalExpenses }