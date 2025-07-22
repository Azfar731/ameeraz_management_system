import { prisma_client } from "~/.server/db";
import { updateTodaysBalance } from "../balance/db";



const create_balance_transaction = async (data: {
    amount: number;
    type: "add" | "subtract";
    userId: string;
}) => {""
    const transaction = await prisma_client.$transaction(async (tx) => {
        await updateTodaysBalance({tx, amount: data.amount, operation: data.type });

        const balance_transaction = await tx.balance_Transaction.create({
            data: {
                amount: data.amount,
                type: data.type === "add" ? "added" : "subtracted",
                userId: data.userId,
            }
        });
        
        return balance_transaction;
    });

    return transaction;
}


const getBalanceTransactions = async ({start_date, end_date}: {
    start_date: Date;
    end_date: Date;
}) => {
    const transactions = await prisma_client.balance_Transaction.findMany({
        where: {
            created_at: {
                gte: start_date,
                lte: end_date,
            },
        },
        include: {
            user: true,
        },
    });

    return transactions;
}

export { create_balance_transaction, getBalanceTransactions };
