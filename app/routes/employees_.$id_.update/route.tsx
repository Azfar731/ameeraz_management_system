import Employee_Form from "~/components/employees/employee_form";
import { useActionData, useLoaderData } from "@remix-run/react";
import { EmployeeErrors } from "~/utils/employee/types";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  replace,
} from "@remix-run/node";
import { getEmployeeFormData } from "~/utils/employee/functions.server";
import { Employee } from "@prisma/client";
import { employeeSchema } from "~/utils/employee/validation";

import { getEmployeeFromId, updateEmployee } from "~/utils/employee/db.server";
export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  if (!id) {
    throw new Error("Employee id not provided for Employee Update Page");
  }
  const employee = await getEmployeeFromId(id);
  if (!employee) {
    throw new Error(`Employee with id ${id} not found`);
  }
  return { employee };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { id } = params;
  if (!id) {
    throw new Error("Id not found in URL");
  }

  const formData = await request.formData();
  const employeeData = getEmployeeFormData(formData);

  const validationResult = employeeSchema.safeParse(employeeData);
  if (!validationResult.success) {
    return { errors: validationResult.error.flatten().fieldErrors };
  }
  const {
    emp_fname,
    emp_lname,
    emp_mobile_num,
    emp_status,
    base_salary,
    percentage,
  } = validationResult.data;

  const updated_employee = await updateEmployee({
    emp_id: id,
    emp_fname,
    emp_lname,
    emp_mobile_num,
    base_salary,
    percentage,
    emp_status,
  });

  throw replace(`/employees/${updated_employee.emp_id}`);
}


export default function Update_Employee() {
  const actionData = useActionData<{ errors: EmployeeErrors }>();

  const { employee } = useLoaderData<{ employee: Employee }>();
  console.log(employee);
  return (
    <div className="flex justify-center items-center ">
      <Employee_Form employee={employee} errorMessage={actionData?.errors} />
    </div>
  );
}
