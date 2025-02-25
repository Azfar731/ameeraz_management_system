import { Deal, Employee } from "@prisma/client";
import { SerializeFrom } from "@remix-run/node";
import { Form, useSubmit } from "@remix-run/react";
import { useState, useEffect } from "react";
import Select, { OnChangeValue } from "react-select";
import {
  fetchDeals,
  fetchServices,
  getEmployeeOptions,
} from "shared/utilityFunctions";

import {
  ServiceSaleRecordWithRelations,
  ServiceSaleRecordUpdateErrors,
} from "~/utils/serviceSaleRecord/types";

export default function Service_Sale_Record_Update_Form({
  record,
  deals,
  employees,
  errorMessages,
}: {
  record: SerializeFrom<ServiceSaleRecordWithRelations>;
  deals: SerializeFrom<Deal[]>;
  employees: SerializeFrom<Employee[]>;
  errorMessages?: ServiceSaleRecordUpdateErrors;
}) {
  const submit = useSubmit();

  const [dealsQuantity, setDealsQuantity] = useState<
    { id: string; quantity: number }[]
  >(
    record.deal_records
      .filter((record) => !record.deal.auto_generated)
      .map((record) => ({ id: record.deal_id, quantity: record.quantity }))
  );

  const [servicesQuantity, setServicesQuantity] = useState<
    { id: string; quantity: number }[]
  >(
    record.deal_records
      .filter((record) => record.deal.auto_generated)
      .map((record) => ({ id: record.deal_id, quantity: record.quantity }))
  );

  const [employeesWorkShare, setEmployeesWorkShare] = useState<
    { id: string; work_share: number }[]
  >(record.employees.map((rec) => ({ id: rec.emp_id, work_share: rec.work_share })));

  const onDealsChange = (
    newValue: OnChangeValue<{ value: string; label: string }, true>
  ) => {
    setDealsQuantity((prev) => {
      //remove deleted entries
      const tmp = prev.filter((entry) => {
        return newValue.find((deal) => deal.value === entry.id);
      });

      //add any new entries
      return newValue.map((entry) => {
        const deal_quantity_pair = tmp.find((deal) => deal.id === entry.value);
        return deal_quantity_pair
          ? deal_quantity_pair
          : { id: entry.value, quantity: 1 };
      });
    });
  };

  const onServicesChange = (
    newValue: OnChangeValue<{ value: string; label: string }, true>
  ) => {
    setServicesQuantity((prev) => {
      //remove deleted entries
      const tmp = prev.filter((entry) => {
        return newValue.find((service) => service.value === entry.id);
      });

      //add any new entries
      return newValue.map((entry) => {
        const service_quantity_pair = tmp.find(
          (service) => service.id === entry.value
        );
        return service_quantity_pair
          ? service_quantity_pair
          : { id: entry.value, quantity: 1 };
      });
    });
  };

  const onEmployeeChange = (
    newValue: OnChangeValue<{ value: string; label: string }, true>
  ) => {
    setEmployeesWorkShare((prev) => {
      //remove deleted entries
      const tmp = prev.filter((entry) => {
        return newValue.find((emp) => emp.value === entry.id);
      });

      //add any new entries
      return newValue.map((entry) => {
        const emp_quantity_pair = tmp.find((emp) => emp.id === entry.value);
        return emp_quantity_pair
          ? emp_quantity_pair
          : { id: entry.value, work_share: 0 };
      });
    });
  };

  //update quantity value for deals
  const OnDealsQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDealsQuantity((prev) =>
      prev.map((deal) =>
        deal.id === name ? { ...deal, quantity: Number(value) } : deal
      )
    );
  };

  const OnServicesQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setServicesQuantity((prev) =>
      prev.map((service) =>
        service.id === name ? { ...service, quantity: Number(value) } : service
      )
    );
  };

  const onEmployeeWorkShareChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setEmployeesWorkShare((prev) =>
      prev.map((emp) =>
        emp.id === name ? { ...emp, work_share: Number(value) } : emp
      )
    );
  };

  const renderDealsQuantity = dealsQuantity
    .filter(
      (rec) =>
        deals.find((deal) => deal.deal_id === rec.id)?.auto_generated === false
    )
    .map((record, index) => {
      return (
        <div
          key={record.id}
          className="mt-4 w-full flex justify-between items-center"
        >
          <label
            htmlFor={`Deal-${index}`}
            className="text-gray-700 text-sm font-bold mb-2 pr-4 w-1/3"
          >
            {}
            {deals.find((deal) => deal.deal_id === record.id)?.deal_name}
          </label>
          <input
            type="number"
            id={`Deal-${index}`}
            name={record.id}
            min={1}
            defaultValue={record.quantity}
            onChange={OnDealsQuantityChange}
            required
            placeholder="2"
            className="px-3 py-2 border border-gray-300 rounded-md mb-4 w-2/3"
          />
        </div>
      );
    });

  const renderServicesQuantity = servicesQuantity.map((record, index) => {
    return (
      <div
        key={record.id}
        className="mt-4 w-full flex justify-between items-center"
      >
        <label
          htmlFor={`Service-${index}`}
          className="text-gray-700 text-sm font-bold mb-2 pr-4 w-1/3"
        >
          {}
          {deals.find((deal) => deal.deal_id === record.id)?.deal_name}
        </label>
        <input
          type="number"
          id={`Service-${index}`}
          name={record.id}
          min={1}
          defaultValue={record.quantity}
          onChange={OnServicesQuantityChange}
          required
          placeholder="2"
          className="px-3 py-2 border border-gray-300 rounded-md mb-4 w-2/3"
        />
      </div>
    );
  });

  const renderEmployeesWorkShare = employeesWorkShare.map((emp, index) => {
    return (
      <div
        key={emp.id}
        className="mt-4 w-full flex justify-between items-center"
      >
        <label
          htmlFor={`Emp-${index}`}
          className="text-gray-700 text-sm font-bold mb-2 pr-4 w-1/3"
        >
          {employees.find((employee) => employee.emp_id === emp.id)?.emp_fname}
        </label>
        <input
          type="number"
          id={`Emp-${index}`}
          name={emp.id}
          min={0}
          defaultValue={emp.work_share}
          onChange={onEmployeeWorkShareChange}
          required
          placeholder="1234"
          className="px-3 py-2 border border-gray-300 rounded-md mb-4 w-2/3"
        />
      </div>
    );
  });
  const calculateExpectedAmount = () => {
    return (
      dealsQuantity.reduce((acc, curr) => {
        const deal = deals.find((deal) => deal.deal_id === curr.id);
        if (!deal) {
          throw new Error(`Unexpected Error. Deal not found while calculating expected amount. ID: ${curr.id}`);
        }
        return acc + deal.deal_price * curr.quantity;
      }, 0) +
      servicesQuantity.reduce((acc, curr) => {
        const service = deals.find((deal) => deal.deal_id === curr.id);
        if (!service) {
          throw new Error(`Unexpected Error. Service not found while calculating expected amount. ID: ${curr.id}`);
        }
        return acc + service.deal_price * curr.quantity;
      }, 0)
    );
  };
  const [expectedAmount, setExpectedAmount] = useState(
    calculateExpectedAmount()
  );

  useEffect(() => {
    setExpectedAmount(calculateExpectedAmount());
  }, [dealsQuantity, servicesQuantity, deals, expectedAmount]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    // Prepare form data
    const dataObject = {
      mobile_num: formData.get("mobile_num")?.toString() || "",
      amount_charged: Number(formData.get("amount_charged")) || 0,
      deals: dealsQuantity,
      services: servicesQuantity,
      employees: employeesWorkShare,
    };
    console.log("Final form data: ", dataObject);

    // Submit form
    submit(dataObject, { method: "post", encType: "application/json" });
  };
  return (
    <Form
      method="post"
      onSubmit={handleSubmit}
      className="bg-white mt-14 p-6 rounded shadow-md w-80 "
    >
      <>
        <label
          htmlFor="mobile_num"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Client Mobile Number
        </label>
        <input
          type="text"
          name="mobile_num"
          id="mobile_num"
          className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
          defaultValue={record.client.client_mobile_num}
          required
        />
      </>
      {errorMessages?.mobile_num && (
        <h2 className="text-red-500 font-semibold">
          {errorMessages.mobile_num[0]}
        </h2>
      )}
      <label
        htmlFor="service"
        className="block text-gray-700 text-sm font-bold mb-2"
      >
        Service Taken
      </label>
      <Select
        isMulti
        name="services"
        onChange={onServicesChange}
        options={fetchServices(deals.filter((deal) => deal.auto_generated))}
        defaultValue={record.deal_records
          .filter((record) => record.deal.auto_generated)
          .map((record) => ({
            value: record.deal_id,
            label: record.deal.deal_name,
          }))}
        className="basic-multi-select mb-4"
        classNamePrefix="select"
      />
      {renderServicesQuantity}
      {errorMessages?.services && (
        <h2 className="text-red-500 font-semibold">
          {errorMessages.services[0]}
        </h2>
      )}
      <label
        htmlFor="deal"
        className="block text-gray-700 text-sm font-bold mb-2"
      >
        Deal Taken
      </label>
      <Select
        isMulti
        name="deals"
        onChange={onDealsChange}
        id="deal"
        options={fetchDeals(deals)}
        defaultValue={record.deal_records
          .filter((record) => !record.deal.auto_generated)
          .map((record) => ({
            value: record.deal_id,
            label: record.deal.deal_name,
          }))}
        className="basic-multi-select mb-4"
        classNamePrefix="select"
      />
      {renderDealsQuantity}
      {errorMessages?.deals && (
        <h2 className="text-red-500 font-semibold">{errorMessages.deals[0]}</h2>
      )}
      <div className="text-gray-700 mb-4">
        Expected Total Amount: {expectedAmount}
      </div>
      <div className="text-gray-700 mb-4">
        Amount Paid: {record.transactions.reduce((acc, curr) => acc + curr.amount_paid, 0)}
      </div>
      <label
        htmlFor="amount_charged"
        className="block text-gray-700 text-sm font-bold mb-2"
      >
        Amount Charged
      </label>
      <input
        type="number"
        name="amount_charged"
        id="amount_charged"
        className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
        defaultValue={record.total_amount}
        min={0}
        required
      />
      {errorMessages?.amount_charged && (
        <h2 className="text-red-500 font-semibold">
          {errorMessages.amount_charged[0]}
        </h2>
      )}
      {errorMessages?.amount_paid && (
        <h2 className="text-red-500 font-semibold">
          {errorMessages.amount_paid[0]}
        </h2>
      )}
      <Select
        isMulti
        name="employees"
        onChange={onEmployeeChange}
        options={getEmployeeOptions(employees)}
        defaultValue={record.employees.map((emp) => ({
          value: emp.emp_id,
          label: `${emp.employee.emp_fname} ${emp.employee.emp_lname}`,
        }))}
        className="basic-multi-select mb-4"
        classNamePrefix="select"
      />
      {renderEmployeesWorkShare}
      {errorMessages?.employees && (
        <h2 className="text-red-500 font-semibold">
          {errorMessages.employees[0]}
        </h2>
      )}
      <div className="flex justify-center items-center mt-6">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Update
        </button>
      </div>
    </Form>
  );
}
