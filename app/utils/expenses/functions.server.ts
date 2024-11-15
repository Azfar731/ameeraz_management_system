const getExpenseFormData = (formData: FormData) => {
    const amount_paid = (formData.get("amount_paid") as string) || "";
    const description = (formData.get("description") as string) || "";

    return {
        amount_paid,
        description,
    };
};

export { getExpenseFormData };
