import { prisma_client } from ".server/db";
import { Employee } from "@prisma/client";
import {
  useLoaderData,
  Form,
  useOutletContext,
  useSubmit,
  useNavigate,
  useActionData,
  redirect,
} from "@remix-run/react";
import { useRef, useState } from "react";
import Select, { OnChangeValue } from "react-select";
import { FormType } from "~/utils/types";
import {
  create_service_record,
  validate_data,
} from ".server/utitlityFunctions";
import { ActionFunctionArgs } from "@remix-run/node";
import { getEmployeeOptions } from "shared/utilityFunctions";

export async function loader() {
  const employees = await prisma_client.employee.findMany();
  return { employees };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData: FormType = await request.json();
  const employees = formData.employees;
  // Calculate total work share of employees
  if (employees.length < 1)
    return { msg: "Atleast 1 employee must be selcted" };

  const total_work_share = calculateTotalWorkShare(employees);

  // Validate if amount charged matches total work share
  const validationError = validateWorkShare(
    total_work_share,
    formData.amount_charged
  );
  if (validationError) {
    return { msg: validationError };
  }

  // Validate the entire form data
  const isNotValid = validate_data(formData);
  if (!isNotValid) {
    // Create the service record and redirect to the new record's page
    const record = await create_service_record(formData);
    return redirect(`/salerecord/${record.service_record_id}`);
  } else {
    return isNotValid;
  }
}

// Helper function to calculate total work share of employees
function calculateTotalWorkShare(
  employees: { id: string; work_share: number }[]
): number {
  return employees.reduce((total, emp) => total + emp.work_share, 0);
}

// Helper function to validate if amount charged matches total work share
function validateWorkShare(
  total_work_share: number,
  amount_charged: number
): string | null {
  if (amount_charged !== total_work_share) {
    return "Amount charged must match Employees total Work share";
  }
  return null;
}

// The validate_data and create_service_record functions remain unchanged.

export default function Part3() {
  //action data
  const actionData = useActionData<{ msg: string } | undefined>();

  //context data
  const { formData, setFormData } = useOutletContext<{
    formData: FormType;
    setFormData: React.Dispatch<React.SetStateAction<FormType>>;
  }>();

  const getEmpList = () => {
    if (formData.employees) {
      const empList = formData.employees.map((emp) => {
        const employee = employees.find(
          (employee) => employee.emp_id === emp.id
        );
        return {
          id: emp.id,
          name: employee
            ? `${employee.emp_fname} ${employee.emp_lname}`
            : "No employee exists",
        };
      });
      return empList;
    } else {
      return [];
    }
  };

  const { employees } = useLoaderData<{ employees: Employee[] }>();
  const [selectedEmpList, setSelectedEmpList] = useState<
    {
      id: string;
      name: string;
    }[]
  >(getEmpList());

  const formRef = useRef<HTMLFormElement>(null);

  const employee_options = getEmployeeOptions(employees);

  const navigate = useNavigate();
  const submit = useSubmit();

  const getDefaultValue = () => {
    return selectedEmpList.map((emp) => {
      return { value: emp.id, label: emp.name };
    });
  };

  const empWorkShareList = selectedEmpList.map((emp, index) => {
    return (
      <div key={emp.id} className="mt-4 w-full flex justify-between items-center">
        <label
          htmlFor={`Emp-${index}`}
          className="text-gray-700 text-sm font-bold mb-2 pr-4 w-1/3"
        >
          {emp.name}
        </label>
        <input
          type="number"
          id={`Emp-${index}`}
          name={`Emp-${index}-share`}
          min={0}
          defaultValue={
            formData.employees.find((employee) => employee.id === emp.id)
              ?.work_share || undefined
          }
          required
          placeholder="1234"
          className="px-3 py-2 border border-gray-300 rounded-md mb-4 w-2/3"
        />
      </div>
    );
  });

  const onEmployeeChange = (
    newValue: OnChangeValue<{ value: string; label: string }, true>
  ) => {
    setSelectedEmpList((prev) => {
      return newValue.map((entry) => {
        const emp = prev.find((emp) => emp.id === entry.value);
        if (emp) {
          return emp;
        } else {
          return { id: entry.value, name: entry.label };
        }
      });
    });
  };
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Extract form data
    const employees = getEmployeeWorkShare(event.currentTarget);

    // Prepare form data
    const formDatalocal = { ...formData, employees };
    console.log("Final form data: ", formDatalocal);

    // Submit form
    submit(formDatalocal, { method: "post", encType: "application/json" });
  };

  const GoToPrevPage = () => {
    const form = formRef.current;
    if (!form) return;

    // Extract form data
    const employees = getEmployeeWorkShare(form);

    // Update formData with employee work share
    setFormData((prev) => ({ ...prev, employees }));

    // Navigate to the previous page
    navigate("../part2");
  };

  // Helper function to extract employee work share from the form
  function getEmployeeWorkShare(
    formElement: HTMLFormElement
  ): { id: string; work_share: number }[] {
    const formData = new FormData(formElement);

    return selectedEmpList.map((emp, index) => {
      const work_share: number =
        Number(formData.get(`Emp-${index}-share`)) || 0;
      return { id: emp.id, work_share };
    });
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <Form
        method="post"
        ref={formRef}
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-120"
      >
        <div className="block text-gray-700 text-sm font-bold mb-2" >Amount Charged: <span className="font-semibold">{formData.amount_charged}</span></div>
        <label
          htmlFor="employees"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Employees
        </label>
        <Select
          isMulti
          id="employees"
          name="employees"
          onChange={onEmployeeChange}
          options={employee_options}
          defaultValue={getDefaultValue()}
          className="mt-4"
          classNamePrefix="select"
          required
        />
        {empWorkShareList}
        {actionData?.msg && (
          <h2 className="text-red-500 font-semibold">{actionData.msg}</h2>
        )}
        <div className="flex justify-between items-center mt-6">
          <button
            type="button"
            onClick={GoToPrevPage}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Previous
          </button>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Next
          </button>
        </div>
      </Form>
    </div>
  );
}
