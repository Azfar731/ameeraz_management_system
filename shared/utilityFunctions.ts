import { Category, Deal, Employee } from "@prisma/client";

function formatDate(input: Date | string): string {
    let date: Date;
    if (typeof input === "string") {
        date = new Date(input);
    } else {
        date = input;
    }

    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
}

function fetchDeals<
    T extends Pick<Deal, "deal_id" | "deal_name" | "auto_generated">,
>(deals: T[]) {
    return deals
        .filter((deal) => !deal.auto_generated)
        .map((deal) => {
            return { value: deal.deal_id, label: deal.deal_name };
        });
}

function fetchServices<
    T extends Pick<Deal, "deal_id" | "deal_name" | "auto_generated">,
>(deals: T[]) {
    return deals
        .filter((deal) => deal.auto_generated)
        .map((deal) => {
            return { value: deal.deal_id, label: deal.deal_name };
        });
}

function getEmployeeOptions(employees: Employee[]) {
    return employees.map((employee) => {
        return { value: employee.emp_id, label: `${employee.emp_fname} ${employee.emp_lname}` };
    });
}


function getCategoryOptions(categories: Category[]){
    return categories.map(category => {
        return {value: category.cat_id, label: category.cat_name}
    })
}

export { fetchDeals, fetchServices, formatDate, getEmployeeOptions, getCategoryOptions };
