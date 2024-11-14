import { getServiceSaleRecordFromId } from "./db.server";
const getPendingAmount = async (serviceRecordId: string) => {
    const service_sale_record = await getServiceSaleRecordFromId({
        id: serviceRecordId,
        includeTransactions: true,
    });
    if (!service_sale_record) {
        throw new Error(`No Sale record with id: ${serviceRecordId} exists`);
    }
    return service_sale_record.total_amount -
        service_sale_record.transactions.reduce((sum, trans) => {
            return sum + trans.amount_paid;
        }, 0);
};

export { getPendingAmount };
