type ExpenseErrors = {
    amount_paid?: string[];
    description?: string[];
};


type ExpenseDateErrors = {
    start_date?: string[];
    end_date?: string[];
}

export type { ExpenseErrors, ExpenseDateErrors };
