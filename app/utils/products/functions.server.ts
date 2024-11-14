

const fetchProductFormData = (formData: FormData) => {
    const prod_name = formData.get("name") || ""
    const quantity = formData.get("quantity")  || "0"

    return { prod_name, quantity} 

}

export { fetchProductFormData}