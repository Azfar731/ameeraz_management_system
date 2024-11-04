import { EmployeeErrors, EmployeeValues } from "~/utils/employee/types";
import Employee_Form from "~/components/employees/employee_form";
import { replace, useActionData } from "@remix-run/react";
import { ActionFunctionArgs } from "@remix-run/node";
import { getEmployeeFormData } from "~/utils/employee/functions.server";
import { prisma_client } from ".server/db";
import { employeeSchema } from "~/utils/employee/validation";

export async function action({request}: ActionFunctionArgs){
    const formData = await request.formData();
    const employeeData = getEmployeeFormData(formData)

    
  const validationResult = employeeSchema.safeParse(employeeData);
  if (!validationResult.success) {
    return { errors: validationResult.error.flatten().fieldErrors };
  }
  const { emp_fname, emp_lname, emp_mobile_num, base_salary, percentage } =
    validationResult.data;

    const employee= await create_employee_fn({emp_fname, emp_lname, emp_mobile_num,  base_salary, percentage})

    throw replace( `/employees/${employee.emp_id}`);
}   

const create_employee_fn = async({
    emp_fname,
    emp_lname,
    emp_mobile_num,
    base_salary,
    percentage,
    
}: EmployeeValues)=>{
    const employee = await prisma_client.employee.create({
        data: {
            emp_fname: emp_fname.toLowerCase(),
            emp_lname: emp_lname.toLowerCase(),
            emp_mobile_num,
            base_salary,
            percentage,
            
        }   
    })
    return employee
}


export default function Create_Employee(){
    const actionData = useActionData<{errors: EmployeeErrors}>()

    return(
        <div className="flex justify-center items-center h-screen">
            <Employee_Form errorMessage={actionData?.errors}/>
        </div>
    )
}