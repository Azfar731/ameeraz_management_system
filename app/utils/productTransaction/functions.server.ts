import { getProductSaleRecordByIdWithRelations } from "../productSaleRecord/db.server";

const getProductSaleRecordPendingAmount = async (id: string) => {
    const product_sale_record = await getProductSaleRecordByIdWithRelations({
      id,
    });
    if (!product_sale_record) {
      throw new Error(`No product sale record with id: ${id} exists`);
    }
    return (
      product_sale_record.total_amount -
      product_sale_record.transactions.reduce((sum, trans) => {
        return sum + trans.amount_paid;
      }, 0)
    );
  };

  export { getProductSaleRecordPendingAmount };