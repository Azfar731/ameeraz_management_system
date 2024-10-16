import { FormType } from "~/utils/types";
import { prisma_client } from "./db";
const validate_data = (formData: FormType): string | null => {
    // 1. Type checks, success returns null
    const types_response = validate_types(formData);
    if (types_response) return types_response;

    // 2. Validate numerical values greater than 0, success returns null
    const cond_response = validate_conditions(formData);
    if (cond_response) return cond_response;

    // If all validations pass, return null (indicating no errors)
    return null;
};
const validate_types = (formData: FormType): { msg: string } | null => {
    const {
        amount_charged,
        amount_paid,
        mobile_num,
        deals,
        services,
        employees,
        mode_of_payment,
    } = formData;

    if (typeof amount_charged !== "number" || typeof amount_paid !== "number") {
        return { msg: "Amount charged and paid must be numbers." };
    }

    if (typeof mobile_num !== "string") {
        return { msg: "Mobile number must be a string." };
    }

    if (
        !Array.isArray(deals) ||
        !deals.every((deal) =>
            typeof deal.value === "string" && typeof deal.label === "string"
        )
    ) {
        return {
            msg: "Deals must be an array of objects with value and label as strings.",
        };
    }

    if (
        !Array.isArray(services) ||
        !services.every(
            (service) =>
                typeof service.value === "string" &&
                typeof service.label === "string"
        )
    ) {
        return {
            msg: "Services must be an array of objects with value and label as strings.",
        };
    }

    if (
        !Array.isArray(employees) ||
        !employees.every(
            (employee) =>
                typeof employee.id === "string" &&
                typeof employee.work_share === "number"
        )
    ) {
        return {
            msg: "Employees must be an array of objects with id as string and work_share as a number.",
        };
    }

    if (
        typeof mode_of_payment !== "object" ||
        typeof mode_of_payment.value !== "string" ||
        typeof mode_of_payment.label !== "string"
    ) {
        return {
            msg: "Mode of payment must be an object with value as a string and label as a string.",
        };
    }

    return null;
};

const validate_conditions = (formData: FormType): { msg: string } | null => {
    const { amount_charged, amount_paid, employees } = formData;

    if (amount_charged <= 0) {
        return { msg: "Amount charged must be greater than 0." };
    }

    if (!employees.every((employee) => employee.work_share > 0)) {
        return { msg: "Each employee's work share must be greater than 0." };
    }

    if (amount_paid > amount_charged) {
        return { msg: "Amount paid cannot be greater than amount charged." };
    }

    const totalWorkShare = employees.reduce(
        (sum, employee) => sum + employee.work_share,
        0
    );
    if (amount_charged !== totalWorkShare) {
        return {
            msg: "Amount charged must equal the total of employees' work share.",
        };
    }

    return null;
};

const create_service_record = async (formData: FormType) => {
    const {
        amount_charged,
        amount_paid,
        mobile_num,
        deals,
        services,
        employees,
        mode_of_payment,
    } = formData;

    const all_deals = [...deals, ...services];

    const record = await prisma_client.service_Sale_Record.create({
        data: {
            total_amount: amount_charged,
            payment_cleared: amount_charged === amount_paid,
            client: {
                connect: { client_mobile_num: mobile_num },
            },
            deals: {
                connect: all_deals.map((deal) => ({ deal_id: deal.value })),
            },
            transactions: {
                create: [{
                    amount_paid,
                    mode_of_payment: mode_of_payment.value,
                }],
            },
            employees: {
                create: employees.map((employee) => ({
                    emp_id: employee.id,
                    work_share: employee.work_share,
                })),
            },
        },
    });
    return record;
};

export { create_service_record, validate_data };
