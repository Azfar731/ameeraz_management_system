import { EmployeeErrors } from "~/utils/employee/types";
import Employee_Form from "~/components/employees/employee_form";
import { replace, useActionData } from "@remix-run/react";
import { ActionFunctionArgs } from "@remix-run/node";
import { getEmployeeFormData } from "~/utils/employee/functions.server";
import { employeeSchema } from "~/utils/employee/validation";
import { createEmployee } from "~/utils/employee/db.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const employeeData = getEmployeeFormData(formData);

  const validationResult = employeeSchema.safeParse(employeeData);
  if (!validationResult.success) {
    return { errors: validationResult.error.flatten().fieldErrors };
  }
  const { emp_fname, emp_lname, emp_mobile_num, base_salary, percentage } =
    validationResult.data;

  const employee = await createEmployee({
    emp_fname,
    emp_lname,
    emp_mobile_num,
    base_salary,
    percentage,
  });

  throw replace(`/employees/${employee.emp_id}`);
}


export default function Create_Employee() {
  const actionData = useActionData<{ errors: EmployeeErrors }>();

  return (
    <div className="flex justify-center items-center h-screen">
      <Employee_Form errorMessage={actionData?.errors} />
    </div>
  );
}
