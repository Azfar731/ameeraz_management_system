import { Client } from "@prisma/client";

type PaymentModes = "cash" | "bank_transfer" | "card";

type TransactionModes = "sold" | "bought" | "returned";

type FormType = {
    amount_charged: number;
    amount_paid: number;
    mobile_num: string;
    deals: { id: string; quantity: number }[];
    services: { id: string; quantity: number }[];
    employees: { id: string; work_share: number }[];
    mode_of_payment: { value: PaymentModes; label: string };
};

type MenuOption = {
    value: string;
    label: string;
};

type ClientValues =
    & Pick<
        Client,
        "client_fname" | "client_lname" | "client_area" | "client_mobile_num"
    >
    & {
        client_id?: string; // Add client_id as optional
    };

export type {
    ClientValues,
    FormType,
    MenuOption,
    PaymentModes,
    TransactionModes,
};
