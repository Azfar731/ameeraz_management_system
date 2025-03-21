import { EmployeeErrors } from "~/utils/employee/types";
import Employee_Form from "~/components/employees/employee_form";
import { replace, useActionData } from "@remix-run/react";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getEmployeeFormData } from "~/utils/employee/functions.server";
import { employeeSchema } from "~/utils/employee/validation";
import { createEmployee } from "~/utils/employee/db.server";
import { authenticate } from "~/utils/auth/functions.server";
import { Prisma } from "@prisma/client";

export async function loader({request}: LoaderFunctionArgs){
  await authenticate({request, requiredClearanceLevel: 3 });
  return null;
}
export async function action({ request }: ActionFunctionArgs) {
  await authenticate({request, requiredClearanceLevel: 3 });
  
  const formData = await request.formData();
  const employeeData = getEmployeeFormData(formData);

  const validationResult = employeeSchema.safeParse(employeeData);
  if (!validationResult.success) {
    return { errors: validationResult.error.flatten().fieldErrors };
  }
  const { emp_fname, emp_lname, emp_mobile_num, base_salary, percentage } =
    validationResult.data;

  try {
    const employee = await createEmployee({
      emp_fname,
      emp_lname,
      emp_mobile_num,
      base_salary,
      percentage,
    });

    throw replace(`/employees/${employee.emp_id}`);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          errors: {
            emp_mobile_num: [
              `Employee with mobile number: ${validationResult.data.emp_mobile_num} already exists`,
            ],
          },
        };
      } else {
        throw error;
      }
    } else {
      throw error;
    }
  }
}

export default function Create_Employee() {
  const actionData = useActionData<{ errors: EmployeeErrors }>();

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Employee_Form errorMessage={actionData?.errors} />
    </div>
  );
}
