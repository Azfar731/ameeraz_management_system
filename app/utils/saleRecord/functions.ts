import { ServiceSaleRecordWithRelations } from "./types";
import { SerializeFrom } from "@remix-run/node";

const updateServiceSaleRecordDateTypes = (
    recvd_service_sale_record: SerializeFrom<
        Omit<ServiceSaleRecordWithRelations, "employees" | "deals">
    >,
) => {
    const updated_transaction = recvd_service_sale_record.transactions.map(
        (trans) => {
            return {
                ...trans,
                created_at: new Date(trans.created_at),
                modified_at: new Date(trans.modified_at),
            };
        },
    );

    const updated_service_sale_record = {
        ...recvd_service_sale_record,
        created_at: new Date(recvd_service_sale_record.created_at),
        modified_at: new Date(recvd_service_sale_record.modified_at),
        client: {
            ...recvd_service_sale_record.client,
            created_at: new Date(recvd_service_sale_record.client.created_at),
        },
        transactions: updated_transaction,
    };

    return updated_service_sale_record;
};

export { updateServiceSaleRecordDateTypes };
