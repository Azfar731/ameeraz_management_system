import { Service_Sale_Record, Client,Deal,Employee_Record_JT, Employee,Client_Transaction } from "@prisma/client";

type PaymentModes = "cash" | "bank_transfer" | "card";

type FormType = {
    amount_charged: number;
    amount_paid: number;
    mobile_num: string;
    deals: MenuOption[];
    services: MenuOption[];
    employees: { id: string; work_share: number }[];
    mode_of_payment: { value: PaymentModes; label: string };
};

type MenuOption = {
    value: string;
    label: string
}

type ServiceSaleRecordWithRelations = Service_Sale_Record & {
    client: Client;
    deals: Deal[];
    employees: (Employee_Record_JT & {
        employee: Employee;
    })[];
    transactions: Client_Transaction[];
};

export type { FormType, PaymentModes, ServiceSaleRecordWithRelations, MenuOption };
