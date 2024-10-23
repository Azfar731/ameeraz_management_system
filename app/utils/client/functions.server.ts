const getClientFormData = (formData: FormData) => {
    const fname = (formData.get("fname") as string) || "";
    const lname = (formData.get("lname") as string) || "";
    const mobile_num = (formData.get("mobile_num") as string) || "";
    const area = (formData.get("area") as string) || "";

    return {
        client_fname: fname,
        client_lname: lname,
        client_mobile_num: mobile_num,
        client_area: area,
    };
};

export { getClientFormData };
