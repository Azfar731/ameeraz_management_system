import { prisma_client } from "~/.server/db";
import { Employee } from "@prisma/client";
const getEmployeeFromId = async (id: string) => {
    const employee = await prisma_client.employee.findFirst({
        where: { emp_id: id },
    });
    return employee;
};

const createEmployee = async ({
    emp_fname,
    emp_lname,
    emp_mobile_num,
    base_salary,
    percentage,
}: Omit<Employee, "emp_id" | "emp_status" | "created_at">) => {
    const employee = await prisma_client.employee.create({
        data: {
            emp_fname: (emp_fname.toLowerCase()),
            emp_lname: (emp_lname.toLowerCase()),
            emp_mobile_num,
            base_salary,
            percentage,
        },
    });
    return employee;
};

const updateEmployee = async ({
    emp_id,
    emp_fname,
    emp_lname,
    emp_mobile_num,
    base_salary,
    percentage,
    emp_status,
}: Omit<Employee, "created_at">) => {
    const updated_employee = await prisma_client.employee.update({
        where: {
            emp_id,
        },
        data: {
            emp_fname: (emp_fname.toLowerCase()),
            emp_lname: (emp_lname.toLowerCase()),
            emp_mobile_num,
            base_salary,
            percentage,
            emp_status,
        },
    });
    return updated_employee;
};

export { createEmployee, getEmployeeFromId, updateEmployee };
