const fetchProductFormData = (formData: FormData) => {
    const prod_name = formData.get("name") || "";
    const quantity = formData.get("quantity") || "0";
    const prod_price = formData.get("price") || "0";
    return { prod_name, quantity, prod_price };
};

export { fetchProductFormData };
