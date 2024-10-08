import { prisma_client } from ".server/db";
import { Employee } from "@prisma/client";
import {
  useLoaderData,
  Form,
  useOutletContext,
  useSubmit,
  useNavigate,
} from "@remix-run/react";
import { useRef, useState } from "react";
import Select, { OnChangeValue } from "react-select";
import { FormType } from "~/utils/types";

export async function loader() {
  const employees = await prisma_client.employee.findMany();
  return { employees };
}

export async function action() {
  return null;
}

export default function Part3() {
  const { employees } = useLoaderData<{ employees: Employee[] }>();
  const [selectedEmpList, setSelectedEmpList] = useState<
    {
      id: string;
      name: string;
    }[]
  >([]);
  const { formData, setFormData } = useOutletContext<{
    formData: FormType;
    setFormData: React.Dispatch<React.SetStateAction<FormType>>;
  }>();
  console.log("Inital Form Data: ",formData)
  const formRef = useRef<HTMLFormElement | undefined>(undefined)
  

  const employee_options = employees.map((employee) => {
    return { value: employee.emp_id, label: employee.emp_name };
  });

  const navigate = useNavigate();
  const submit = useSubmit();

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
    console.log("Final form data: ",formData);
    submit(formData, { method: "post", encType: "application/json" });
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
          className="basic-multi-select mb-4"
          classNamePrefix="select"
        />
        {empWorkShareList}
        <div className="flex justify-apart items-center">
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
