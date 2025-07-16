import { Product_Transaction } from "@prisma/client";
import { SerializeFrom } from "@remix-run/node";
import { ProductTransactionWithRelations } from "./types";


const calculateProductTransaction = (transactions: SerializeFrom<ProductTransactionWithRelations>[]) => {
    const productsBoughtList = transactions.filter(transaction => transaction.record.transaction_type === "bought");
    const productsSoldList = transactions.filter(transaction => transaction.record.transaction_type === "sold");

    const productsBought = {
        cashTransaction:  calculateTotal(productsBoughtList, "cash"),
        bankTransaction:  calculateTotal(productsBoughtList, "bank_transfer"),
        cardTransaction:  calculateTotal(productsBoughtList, "card"),
    }
    
    const productsSold =  {
        cashTransaction:  calculateTotal(productsSoldList, "cash"),
        bankTransaction:  calculateTotal(productsSoldList, "bank_transfer"),
        cardTransaction:  calculateTotal(productsSoldList, "card"),
    }

    return { productsBought, productsSold };
}


const calculateTotal = ( transactions: SerializeFrom<Product_Transaction>[], type: "cash" | "bank_transfer" | "card" ) => {
    return transactions.filter(transaction => transaction.mode_of_payment === type).reduce((total, record) => {
        return total + record.amount_paid;
    }, 0);
}


export {calculateProductTransaction}