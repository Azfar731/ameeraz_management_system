

const getClientTransactionFormData = (formData: FormData) => {
    const amount_paid = formData.get("amount_paid") || "";
    const mode_of_payment = formData.get("mode_of_payment") || "";

    return { amount_paid, mode_of_payment };
};

export { getClientTransactionFormData };
