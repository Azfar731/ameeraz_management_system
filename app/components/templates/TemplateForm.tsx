import { SerializeFrom } from "@remix-run/node";
import { Form, useNavigation, useSubmit } from "@remix-run/react";
import { useEffect, useState } from "react";
import Select from "react-select";
import {
  getAllHeaderTypeMenuOptions,
  getSingleHeaderTypeMenuOption,
} from "~/utils/templates/functions";
import {
  TemplateErrorMessages,
  TemplateWithRelations,
} from "~/utils/templates/types";

const variableTypeOptions = [
  { value: "text", label: "Text" },
  { value: "currency", label: "Currency" },
  { value: "date_time", label: "Date Time" },
];

export default function Template_Form({
  template,
  errorMessages,
}: {
  template?: SerializeFrom<TemplateWithRelations>;
  errorMessages?: TemplateErrorMessages;
}) {
  const navigation = useNavigation()
  const clientPropertyOptions =["client_fname","client_lname","client_mobile_num","client_area","points","none"].map(
    (property) => ({
      value: property,
      label: property,
    })
  );

  const [numVariables, setNumVariables] = useState(
    template?.variables.length || 0
  );
  const [variables, setVariables] = useState(
    template?.variables ||
      Array.from({ length: numVariables }, () => ({
        name: "",
        type: "",
        client_property: "",
      }))
  );

  const submit = useSubmit();

  // Update variables when numVariables changes
  useEffect(() => {
    setVariables((prevVariables) => {
      // Extend or shrink the array based on the new numVariables
      return Array.from(
        { length: numVariables },
        (_, i) =>
          prevVariables[i] || { name: "", type: "", client_property: "" }
      );
    });
  }, [numVariables]);

  const handleVariableChange = (
    index: number,
    field: "name" | "type" | "client_property",
    value: string
  ) => {
    setVariables((prev) =>
      prev.map((variable, i) =>
        i === index ? { ...variable, [field]: value } : variable
      )
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const formObject = Object.fromEntries(formData.entries());
    const data = {
      ...formObject,
      variables: variables.map((variable) => ({
        name: variable.name,
        type: variable.type,
        client_property: variable.client_property,
      })),
    };
    console.log("Data: ", data);
    submit(data, { method: "post", encType: "application/json" });
  };

  return (
    <Form
      method="post"
      onSubmit={handleSubmit}
      className="bg-white mt-14 p-6 rounded shadow-md w-80"
    >
      <div className="w-full flex justify-center items-center">
        <h1 className="block text-gray-700 text-2xl font-bold mt-4">
          {template ? "Update Template" : "Register Template"}
        </h1>
      </div>
      <label
        htmlFor="name"
        className="block text-gray-700 text-sm font-bold mt-4"
      >
        Template
      </label>
      <input
        type="text"
        name="name"
        id="name"
        pattern="^[A-Za-z0-9_]+$"
        className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
        placeholder="insta_deals_template"
        defaultValue={template?.name}
        required
      />
      {errorMessages?.name && (
        <h2 className="text-red-500 font-semibold">{errorMessages.name[0]}</h2>
      )}
      <label
        htmlFor="header_type"
        className="block text-gray-700 text-sm font-bold mt-4"
      >
        Header Type
      </label>
      <Select
        name="header_type"
        options={getAllHeaderTypeMenuOptions()}
        className="basic-multi-select mt-2 z-10"
        classNamePrefix="select"
        defaultValue={
          template
            ? getSingleHeaderTypeMenuOption(template.header_type)
            : undefined
        }
        required
      />
      {errorMessages?.header_type && (
        <h2 className="text-red-500 font-semibold">
          {errorMessages.header_type[0]}
        </h2>
      )}
      <label
        htmlFor="header_var_name"
        className="block text-gray-700 text-sm font-bold mt-4"
      >
        Header Variable Name
      </label>
      <input
        type="text"
        name="header_var_name"
        id="header_var_name"
        pattern="^[A-Za-z0-9_]+$"
        className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
        placeholder="insta_deals_template"
        defaultValue={template?.header_var_name}
        required
      />
      {errorMessages?.header_var_name && (
        <h2 className="text-red-500 font-semibold">
          {errorMessages.header_var_name[0]}
        </h2>
      )}
      <label
        htmlFor="num_of_variables"
        className="block text-gray-700 text-sm font-bold mt-4"
      >
        Number of Variables in Body
      </label>
      <input
        type="number"
        name="num_of_variables"
        id="num_of_variables"
        className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
        placeholder="5"
        value={numVariables}
        min={0}
        onChange={(e) => setNumVariables(Number(e.target.value))}
        required
      />

      {/* Dynamically render variable input fields */}
      {variables.map((variable, index) => (
        <div key={index} className="mt-4">
          <label className="block text-gray-700 text-sm font-bold">
            Variable {index + 1}
          </label>

          <input
            type="text"
            name={`variables[${index}][name]`}
            placeholder="Variable Name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
            value={variable.name}
            onChange={(e) =>
              handleVariableChange(index, "name", e.target.value)
            }
            required
          />
          <Select
            name={`variables[${index}][type]`}
            options={variableTypeOptions}
            className="basic-single mt-2"
            classNamePrefix="select"
            value={variableTypeOptions.find(
              (opt) => opt.value === variable.type
            )}
            onChange={(selected) =>
              handleVariableChange(index, "type", selected?.value || "")
            }
            required
          />
          <Select
            name={`variables[${index}][client_property]`}
            options={clientPropertyOptions}
            className="basic-single mt-2"
            classNamePrefix="select"
            value={clientPropertyOptions.find(
              (opt) => opt.value === variable.client_property
            )}
            onChange={(selected) =>
              handleVariableChange(
                index,
                "client_property",
                selected?.value || ""
              )
            }
            required
          />
        </div>
      ))}
      {errorMessages?.variables && (
        <h2 className="text-red-500 font-semibold">
          {errorMessages.variables[0]}
        </h2>
      )}
      <div className="w-full flex justify-center items-center">
        <button
          type="submit"
          disabled={navigation.state === "loading" || navigation.state === "submitting"}
          className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {template ? "Update" : "Register"}
        </button>
      </div>
    </Form>
  );
}
