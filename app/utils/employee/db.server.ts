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

const getAllEmployees = async () => {
    const employees = await prisma_client.employee.findMany();
    return employees;
};

const getActiveEmployees = async () => {
    return await prisma_client.employee.findMany({
        where: {
            emp_status: true,
        }
    })
}

const getEmployeeWorkRecords = async ({
    emp_ids,
    start_date,
    end_date
}:{
    emp_ids: string[];
    start_date: Date;
    end_date: Date;
}) => {
    const work_records = await prisma_client.employee.findMany({
        
        where: {
            emp_id: emp_ids.length > 0 ? { in: emp_ids } : undefined,
            emp_status: emp_ids.length > 0 ? undefined : true, // If emp_ids are provided, ignore emp_status
        },
        include: {
            records: {
                where: {
                    record: {
                        created_at: {
                            gte: start_date,
                            lte: end_date,
                        }
                    }
                    
                }
            }
        }
    })

    return work_records;
}



export { getActiveEmployees, createEmployee, getAllEmployees, getEmployeeFromId, updateEmployee, getEmployeeWorkRecords };
