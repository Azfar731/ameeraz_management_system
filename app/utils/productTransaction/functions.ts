import { SerializeFrom } from "@remix-run/node";
import { ProductTransactionWithRelations } from "./types";


const calculateProductTransaction = (transactions: SerializeFrom<ProductTransactionWithRelations>[]| ProductTransactionWithRelations[]) => {
    const productsBoughtList = transactions.filter(transaction => transaction.record.transaction_type === "bought");
    const productsSoldList = transactions.filter(transaction => transaction.record.transaction_type === "sold");

    const productsBought = {
        cashTransaction:  calculateTotal({transactions: productsBoughtList,type: "cash"}),
        bankTransaction:  calculateTotal({transactions: productsBoughtList, type:"bank_transfer"}),
        cardTransaction:  calculateTotal({transactions: productsBoughtList, type:"card"}),
    }
    
    const productsSold =  {
        cashTransaction:  calculateTotal({transactions: productsSoldList, type:"cash"}),
        bankTransaction:  calculateTotal({transactions: productsSoldList,type: "bank_transfer"}),
        cardTransaction:  calculateTotal({transactions: productsSoldList, type:"card"}),
    }

    return { productsBought, productsSold };
}

//defined transactions type myself, as ts was showing error due to type Date mismatch
const calculateTotal = ({transactions, type}:{ transactions: {mode_of_payment: "cash" | "bank_transfer" | "card"; amount_paid: number}[] ; type: "cash" | "bank_transfer" | "card"} ) => {
    return transactions.filter(transaction => transaction.mode_of_payment === type).reduce((total, record) => {
        return total + record.amount_paid;
    }, 0);
}


export {calculateProductTransaction}