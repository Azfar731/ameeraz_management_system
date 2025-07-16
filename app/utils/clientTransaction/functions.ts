import { Client_Transaction } from "@prisma/client";
import { SerializeFrom } from "@remix-run/node";


const getClientTransactionFormData = (formData: FormData) => {
    const amount_paid = formData.get("amount_paid") || "";
    const mode_of_payment = formData.get("mode_of_payment") || "";

    return { amount_paid, mode_of_payment };
};

const calculateClientTransaction = (transactions: SerializeFrom<Client_Transaction>[]) => {
    const cashTransaction =  transactions.filter(transaction => transaction.mode_of_payment === "cash").reduce((total, transaction) => {
        return total + transaction.amount_paid;
    }, 0);
    const bankTransaction =  transactions.filter(transaction => transaction.mode_of_payment === "bank_transfer").reduce((total, transaction) => {
        return total + transaction.amount_paid;
    }, 0);
    const cardTransaction =  transactions.filter(transaction => transaction.mode_of_payment === "card").reduce((total, transaction) => {
        return total + transaction.amount_paid;
    }, 0);
    const totalTransaction = cashTransaction + bankTransaction + cardTransaction;
    return { cashTransaction, bankTransaction, cardTransaction, totalTransaction };
}


export { getClientTransactionFormData, calculateClientTransaction };
