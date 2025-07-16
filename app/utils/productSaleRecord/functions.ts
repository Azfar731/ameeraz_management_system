import { Product_Sale_Record } from "@prisma/client";
import { SerializeFrom } from "@remix-run/node";



//function that accepts product sale records array, and returns the total balance
 const calculateProductsSale = (
    records: SerializeFrom<Product_Sale_Record>[]
) => {
    return records.filter(record => record.transaction_type === "sold").reduce((total, record) => {
        return total + record.total_amount ;
    }, 0);
};

 const calculateProductsPurchase = (
    records: SerializeFrom<Product_Sale_Record>[]
) => {
    return records.filter(record => record.transaction_type === "bought").reduce((total, record) => {
        return total + record.total_amount ;
    }, 0);
};

export { calculateProductsSale, calculateProductsPurchase };