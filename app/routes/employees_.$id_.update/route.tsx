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
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { authenticate } from "~/utils/auth/functions.server";
export async function loader({request, params }: LoaderFunctionArgs) {
  await authenticate({request, requiredClearanceLevel: 3 });

  const { id } = params;
  if (!id) {
    throw new Response("Id not provided in the URL", {
      status: 400,
      statusText: "Bad Request",
    });
  }
  const employee = await getEmployeeFromId(id);
  if (!employee) {
    throw new Response(`Employee with id ${id} not found`, {
      status: 404,
      statusText: "Not Found",
    });
  }
  return { employee };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { id } = params;
  if (!id) {
    throw new Response("Id not found in URL", {
      status: 400,
      statusText: "Bad Request",
    });
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

  try {
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
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
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
