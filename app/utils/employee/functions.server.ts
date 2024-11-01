
import { prisma_client } from ".server/db";

const fetchEmployeeFromId = async(id)=>{
    const employee = await prisma_client.employee.findFirst({where: {emp_id: id}})
    return employee;
}
const getEmployeeFormData = (formData: FormData) => {
    const fname = (formData.get("fname") as string) || "";
    const lname = (formData.get("lname") as string) || "";
    const mobile_num = (formData.get("mobile_num") as string) || "";
    const base_salary = parseInt((formData.get("base_salary") as string) || "0", 10);
    const percentage = parseInt((formData.get("percentage") as string) || "0", 10);
    const status = (formData.get("status") as string)?.toLowerCase() === "true" ;

    return {
        emp_fname: fname,
        emp_lname: lname,
        emp_mobile_num: mobile_num,
        base_salary,
        percentage,
        emp_status: status,
    };
};




export { getEmployeeFormData, fetchEmployeeFromId };
