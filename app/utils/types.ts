
type PaymentModes = "cash" | "bank_transfer" | "card";




type FormType = {
    amount_charged: number ;
    amount_paid: number ;
    mobile_num: string ;
    deals: {value: string, label: string}[];
    services: {value: string, label: string}[];
    employees: { id: string; work_share: number }[];
    mode_of_payment: {value: PaymentModes, label: string};
};



export type {FormType,PaymentModes}