const getVendorSearchParams = (searchParams: URLSearchParams) => {
    const vendor_mobile_num = searchParams.get("mobile_num") || undefined;
    const vendor_fname = searchParams.get("fname") || undefined;
    const vendor_lname = searchParams.get("lname") || undefined;

    return { vendor_mobile_num, vendor_fname, vendor_lname };
};

const getVendorFormData = (formData: FormData) => {
    const vendor_fname = (formData.get("fname") as string) || "";
    const vendor_lname = (formData.get("lname") as string) || "";
    const vendor_mobile_num = (formData.get("mobile_num") as string) || "";

    return {
        vendor_fname,
        vendor_lname,
        vendor_mobile_num,
    };
};

export { getVendorFormData, getVendorSearchParams };
