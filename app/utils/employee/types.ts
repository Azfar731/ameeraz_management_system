import { Employee } from "@prisma/client";

type EmployeeErrors = {
    emp_fname?: string[];
    emp_lname?: string[];
    emp_mobile_num?: string[];
    base_salary?: string[];
    percentage?: string[];
};



type EmployeeValues = Omit<Employee, 'emp_id' | 'emp_status'> & {
    emp_id?: string;
    emp_status?: boolean;
  };

export type { EmployeeErrors,EmployeeValues };
