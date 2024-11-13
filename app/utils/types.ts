import {  Client } from "@prisma/client";

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

// type ServiceSaleRecordWithRelations = Service_Sale_Record & {
//     client: Client;
//     deals: Deal[];
//     employees: (Employee_Record_JT & {
//         employee: Employee;
//     })[];
//     transactions: Client_Transaction[];
// };

type ClientValues = Pick<Client, 'client_fname' | 'client_lname' | 'client_area' | 'client_mobile_num'> & {
    client_id?: string; // Add client_id as optional
  };

export type { FormType, PaymentModes, MenuOption, ClientValues };
