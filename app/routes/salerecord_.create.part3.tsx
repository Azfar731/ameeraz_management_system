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

export async function loader() {
  const employees = await prisma_client.employee.findMany();
  return { employees };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData: FormType = await request.json();
  const employees = formData.employees;
  const amount_charged = formData.amount_charged;
  let total_work_share = 0;
  //calculate total_work_share
  employees.forEach((emp) => (total_work_share += emp.work_share));
  if (amount_charged !== total_work_share) {
    return { msg: "Amount charged must match Employees total Work share" };
  }

  //validate data, returns null if successfull
  const isNotValid = validate_data(formData);
  if (!isNotValid) {
    const record = await create_service_record(formData);
    return redirect(`/salerecord/${record.service_record_id}`)
  } else {
    return isNotValid;
  }
}

export default function Part3() {
  //action data
  const actionData = useActionData();
  if (actionData) {
    console.log(actionData);
  }
  //context data
  const { formData, setFormData } = useOutletContext<{
    formData: FormType;
    setFormData: React.Dispatch<React.SetStateAction<FormType>>;
  }>();

  const getEmpList = () => {
    if (formData.employees) {
      const empList = formData.employees.map((emp) => {
        return {
          id: emp.id,
          name:
            employees.find((employee) => employee.emp_id === emp.id)
              ?.emp_fname || "Employee doesn't exist",
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

  const employee_options = employees.map((employee) => {
    return { value: employee.emp_id, label: employee.emp_fname };
  });

  const navigate = useNavigate();
  const submit = useSubmit();

  const getDefaultValue = () => {
    return selectedEmpList.map((emp) => {
      return { value: emp.id, label: emp.name };
    });
  };
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const pageForm = event.currentTarget;
    const pageFormData = new FormData(pageForm);
    const employees = selectedEmpList.map((emp, index) => {
      const work_share: number =
        Number(pageFormData.get(`Emp-${index}-share`)) || 0;
      return { id: emp.id, work_share };
    });
    setFormData((prev) => ({ ...prev, employees }));
    const formDatalocal = {...formData,employees}
    console.log("Final form data: ", formData);
    submit(formDatalocal, { method: "post", encType: "application/json" });
  };

  const empWorkShareList = selectedEmpList.map((emp, index) => {
    return (
      <div key={emp.id} className="w-full flex justify-between items-center">
        <label
          htmlFor={`Emp-${index}`}
          className="text-gray-700 text-sm font-bold mb-2"
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
          placeholder="1234"
          className="px-3 py-2 border border-gray-300 rounded-md mb-4"
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

  const GoToPrevPage = () => {
    // get form data if any employee is selected
    if (selectedEmpList.length > 0) {
      const pageFormData = new FormData(formRef.current);
      // save form data in formData global object
      const employees = selectedEmpList.map((emp, index) => {
        const work_share: number =
          Number(pageFormData.get(`Emp-${index}-share`)) || 0;
        return { id: emp.id, work_share };
      });
      setFormData((prev) => ({ ...prev, employees }));
    }
    //navigate to previous page
    navigate("../part2");
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Form
        method="post"
        ref={formRef}
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-80"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">
          Select Employees
        </h1>
        <Select
          isMulti
          name="employees"
          onChange={onEmployeeChange}
          options={employee_options}
          defaultValue={getDefaultValue()}
          className="basic-multi-select mb-4"
          classNamePrefix="select"
        />
        {empWorkShareList}
        <div className="flex justify-between items-center">
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
