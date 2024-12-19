import { z } from "zod";
import { getClientByMobile } from "../client/db.server";
import { paymentOptions } from "../constant_values";

//  deal_ids,
// employee_ids,
// category_ids,
// client_mobile_num,
// start_date,
// end_date,

const ServiceSaleRecordFetchSchema = z.object({
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format.")
    .transform((str) => {
      const date = new Date(str);
      date.setHours(0, 0, 0, 0);
      return date;
    })
    .optional(),

  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format.")
    .transform((str) => {
      const date = new Date(str);
      date.setHours(23, 59, 59, 999);
      return date;
    })
    .optional(),

  client_mobile_num: z
    .string()
    .regex(
      /^0\d{10}$/,
      "Mobile number must be 11 digits and start with 0.",
    )
    .optional(),

  category_ids: z.array(z.string()).optional(),
  employee_ids: z.array(z.string()).optional(),
  deal_ids: z.array(z.string()).optional(),
}).refine(
  (data) => {
    // Only perform the comparison if both dates are defined
    if (data.start_date && data.end_date) {
      return data.end_date >= data.start_date;
    }
    // If one or both dates are undefined, consider it valid
    return true;
  },
  {
    message: "End date must be greater than start date",
    path: ["end_date"],
  },
).refine(async (data) => {
  if (data.client_mobile_num) {
    return await getClientByMobile(data.client_mobile_num);
  }
  return true;
}, {
  message: "No client found with this mobile number",
  path: ["client_mobile_num"],
}).refine((data) => {
  if (data.end_date) {
    const currentDate = new Date();
    currentDate.setHours(23, 59, 59, 999);
    return data.end_date <= currentDate;
  }
  return true;
}, {
  message: "End date can't be greater than Today's Date",
  path: ["end_date"],
}).superRefine((data) => {
  if (
    !(data.start_date || data.end_date || data.client_mobile_num ||
      data.category_ids || data.employee_ids || data.deal_ids)
  ) {
    data.start_date = new Date();
    data.start_date.setHours(0, 0, 0, 0);
  }
});

const BaseServiceSaleRecordSchema = z
  .object({
    amount_charged: z.number().nonnegative(
      "Amount charged must be greater than 0.",
    ),
    amount_paid: z.number().nonnegative("Amount paid cannot be negative."),
    mobile_num: z
      .string()
      .regex(/^0\d{10}$/, "Mobile number must be 11 digits and start with 0."),
    deals: z.array(
      z.object({
        id: z.string(),
        quantity: z.number().positive("Quantity can't be lower than 1"),
      }),
    ),
    services: z.array(
      z.object({
        id: z.string(),
        quantity: z.number().positive("Quantity can't be lower than 1"),
      }),
    ),
    employees: z
      .array(
        z.object({
          id: z.string(),
          work_share: z
            .number()
            .nonnegative("Employee's workshare can't be smaller than 0."),
        }),
      )
      .nonempty("At least one employee must be selected"),
    mode_of_payment: z.object({
      value: z.enum(paymentOptions, {
        errorMap: () => ({
          message:
            "Mode of Payment must be either cash, card, or bank_transfer",
        }),
      }),
      label: z.string(),
    }),
  });

const ServiceSaleRecordSchema = BaseServiceSaleRecordSchema.refine(
  async (data) => {
    return await getClientByMobile(data.mobile_num);
  },
  {
    message: "No client found with this mobile number",
    path: ["mobile_num"],
  },
)
  .refine(
    (data) => data.deals.length > 0 || data.services.length > 0,
    {
      message: "Select at least one service or deal.",
      path: ["deals", "services"],
    },
  )
  .refine(
    (data) => data.amount_paid <= data.amount_charged,
    {
      message: "Amount paid cannot be greater than amount charged.",
      path: ["amount_paid"],
    },
  )
  .refine(
    (data) => {
      const totalWorkShare = data.employees.reduce(
        (sum, employee) => sum + employee.work_share,
        0,
      );
      return data.amount_charged === totalWorkShare;
    },
    {
      message: "Amount charged must equal the total of employees' work share.",
      path: ["amount_charged"],
    },
  );

const serviceSaleRecordUpdateSchema = BaseServiceSaleRecordSchema.omit({
  mode_of_payment: true,
}).refine(async (data) => {
  return await getClientByMobile(data.mobile_num);
}, {
  message: "No client found with this mobile number",
  path: ["mobile_num"],
}).refine(
  (data) => data.deals.length > 0 || data.services.length > 0,
  {
    message: "Select at least one service or deal.",
    path: ["deals", "services"],
  },
)
  .refine(
    (data) => data.amount_paid <= data.amount_charged,
    {
      message: "Amount paid cannot be greater than amount charged.",
      path: ["amount_paid"],
    },
  )
  .refine(
    (data) => {
      const totalWorkShare = data.employees.reduce(
        (sum, employee) => sum + employee.work_share,
        0,
      );
      return data.amount_charged === totalWorkShare;
    },
    {
      message: "Amount charged must equal the total of employees' work share.",
      path: ["amount_charged"],
    },
  );

export {
  ServiceSaleRecordFetchSchema,
  ServiceSaleRecordSchema,
  serviceSaleRecordUpdateSchema,
};
