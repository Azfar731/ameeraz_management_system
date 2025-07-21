import { getClientTransactionsWithRelations } from "../clientTransaction/db.server";
import { getOperationalExpenses } from "../expenses/db.server";
import { getProductTransactionsWithRelations } from "../productTransaction/db.server";
import { create_balance_record, getBalanceRecordByDate } from "./db";
import { calculateBalanceThroughTransactions } from "./functions";





const calculateDaysEndingBalance = async ({date = new Date()}: {date?: Date}) => {
    const start_date = new Date(date.setHours(0, 0, 0, 0));
    const end_date = new Date(date.setHours(23, 59, 59, 999));

    // Fetch the balance record for the given date
    let balanceRecord = await getBalanceRecordByDate(start_date);
    
    if (!balanceRecord) {
        // If no record exists, create a new one
        balanceRecord = await create_balance_record({ date: start_date });
    }

    // Fetch previous Day's balance
    const previousDay = new Date(start_date);
    previousDay.setDate(previousDay.getDate() - 1);
    const previousDayRecord = await getBalanceRecordByDate(previousDay);
    let startingBalance = 0;
    if (previousDayRecord) {
        startingBalance = previousDayRecord.ending_balance;
    }
    // Calculate the ending balance based on transactions
    const clientTransactions = await getClientTransactionsWithRelations({
        start_date,
        end_date,
        payment_options: ["cash"],
    });

    const productTransactions = await getProductTransactionsWithRelations({
        start_date,
        end_date,
        payment_options: ["cash"],
    });

    const operationalExpenses = await getOperationalExpenses({
        start_date,
        end_date,
    });

    // Calculate the total balance
    const totalSalesBalance = calculateBalanceThroughTransactions({
        clientTransactions: clientTransactions,
        productTransactions: productTransactions,
        operationalExpenses: operationalExpenses,
    });

    const totalBalance = totalSalesBalance + balanceRecord.ending_balance + startingBalance
    return totalBalance;
} 


export {calculateDaysEndingBalance}
