const getServiceFormData = (formData: FormData) => {
  const serv_name = (formData.get("name") as string) || "";
  const serv_price = parseInt((formData.get("price") as string) || "0", 10);
  const serv_category = (formData.get("category") as string) || "";
  const isInactive =
    (formData.get("status") as string)?.toLowerCase() === "false";
  const serv_status = !isInactive;

  return {
    serv_name,
    serv_price,
    serv_category,
    serv_status,
  };
};

export { getServiceFormData };
