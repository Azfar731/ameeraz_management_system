type FormType = {
    total_amount: number | undefined;
    amount_paid: number | undefined;
    mobile_num: string | undefined;
    deals: string[];
    employees: { id: string; work_share: number }[];
    mode_of_payment: "Cash" | "Bank Transfer" | "Card";
};


export type {FormType}