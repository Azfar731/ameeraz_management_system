import { PrismaClient, Role, Service } from "@prisma/client";
import { createCategory } from "~/utils/category/db.server";
import { createClient } from "~/utils/client/db.server";
import { createEmployee } from "~/utils/employee/db.server";
import { createProduct } from "~/utils/products/db.server";
import { createUser } from "~/utils/user/db.server";
import { createVendor } from "~/utils/vendors/db.server";
const prisma_client = new PrismaClient();

async function create_clients() {
    const clients = [
        {
            client_fname: "Azfar",
            client_lname: "Razzaq",
            client_area: "Lahore",
            client_mobile_num: "03134549126",
            
        },
        {
            client_fname: "Lailma",
            client_lname: "Razzaq",
            client_area: "Lahore",
            client_mobile_num: "03334549126",
        },
        {
            client_fname: "Irha",
            client_lname: "Razzaq",
            client_area: "Lahore",
            client_mobile_num: "03334349963",
        },
    ];

    const client_record = await Promise.all(
        clients.map((client) => createClient(client)),
    );
    return client_record;
}

async function create_employees() {
    const emp = [
        {
            emp_fname: "Amna",
            emp_lname: "Batool",
            emp_mobile_num: "04134549126",
            base_salary: 20000,
            percentage: 5,
        },
        {
            emp_fname: "Razia",
            emp_lname: "Batool",
            emp_mobile_num: "05134549126",
            base_salary: 30000,
            percentage: 10,
        },
        {
            emp_fname: "Hax",
            emp_lname: "Batool",
            emp_mobile_num: "06134549126",
            base_salary: 15000,
            percentage: 3,
        },
    ];

    const emp_records = await Promise.all(
        emp.map((emp) => createEmployee(emp)),
    );
    return emp_records;
}

async function create_categories() {
    const categories = [
        { cat_name: "hair" },
        { cat_name: "skin" },
        { cat_name: "nails" },
    ];

    const cat_records = await Promise.all(
        categories.map((cat) => createCategory(cat)),
    );
    return cat_records;
}

async function create_services() {
    const categories = await prisma_client.category.findMany();
    const services = [
        {
            serv_name: "hair cut",
            serv_price: 1170,
            category: {
                connect: categories.find((cat) => cat.cat_name === "hair"),
            },
        },
        {
            serv_name: "facial",
            serv_price: 570,
            category: {
                connect: categories.find((cat) => cat.cat_name === "skin"),
            },
        },
        {
            serv_name: "pedicure",
            serv_price: 850,
            category: {
                connect: categories.find((cat) => cat.cat_name === "nails"),
            },
        },
    ];
    const serv_records = await Promise.all(
        services.map((serv) => prisma_client.service.create({ data: serv })),
    );
    return serv_records;
}

async function create_deals() {
    const services: Service[] = await prisma_client.service.findMany();

    const deals = [
        {
            deal_name: "Summer Hair Package",
            deal_price: 1500,
            activate_from: new Date(),
            activate_till: new Date(
                new Date().setMonth(new Date().getMonth() + 1),
            ),
            services: {
                connect: services.map((serv) => ({ serv_id: serv.serv_id })),
            },
        },
        {
            deal_name: "Solo deal 1",
            deal_price: 1600,
            auto_generated: true,
            activate_from: new Date(),
            activate_till: new Date(
                new Date().setMonth(new Date().getMonth() + 1),
            ),
            services: {
                connect: [{ serv_id: services[0].serv_id }],
            },
        },
        {
            deal_name: "Solo deal 2",
            deal_price: 1700,
            auto_generated: true,
            activate_from: new Date(),
            activate_till: new Date(
                new Date().setMonth(new Date().getMonth() + 1),
            ),
            services: {
                connect: [{ serv_id: services[1].serv_id }],
            },
        },
        {
            deal_name: "Solo deal 3",
            deal_price: 1800,
            auto_generated: true,
            activate_from: new Date(),
            activate_till: new Date(
                new Date().setMonth(new Date().getMonth() + 1),
            ),
            services: {
                connect: [{ serv_id: services[2].serv_id }],
            },
        },
    ];

    const deal_records = await Promise.all(
        deals.map((elem) => prisma_client.deal.create({ data: elem })),
    );
    return deal_records;
}

async function create_vendors() {
    const vendors = [
        {
            vendor_fname: "Ali",
            vendor_lname: "Hassan",
            vendor_mobile_num: "03134549126",
        },
        {
            vendor_fname: "Sara",
            vendor_lname: "Khan",
            vendor_mobile_num: "03134549121",
        },
        {
            vendor_fname: "Zain",
            vendor_lname: "Iqbal",
            vendor_mobile_num: "03134549122",
        },
    ];

    const vendor_records = await Promise.all(
        vendors.map((vendor) => createVendor(vendor)),
    );
    return vendor_records;
}




async function create_products() {
    const products = [
        { prod_name: "Shampoo", prod_price: 250, quantity: 100 },
        { prod_name: "Conditioner", prod_price: 300, quantity: 50 },
        { prod_name: "Soap", prod_price: 50, quantity: 200 },
    ];

    const product_records = await Promise.all(
        products.map((product) => createProduct(product)),
    );
    return product_records;
}

async function create_users(){
    // const users=[{userName:"azfar",password:"astayuno",fname:"azfar",lname:"razzaq",role:"admin" as Role},
    //     {userName:"lailma",password:"astayuno",fname:"lailma",lname:"razzaq",role:"owner" as Role},
    //     {userName:"irha",password:"astayuno",fname:"irha",lname:"razzaq",role:"manager" as Role},
    //     {userName: "haleemah", password: "bunny", fname: "haleemah", lname: "anwary", role: "worker" as Role}]
    
    const users = [{userName:"arbiter",password:"Vanitas10@",fname:"azfar",lname:"razzaq",role:"admin" as Role}]

        const user_records = await Promise.all(users.map((user) => createUser(user)));
        return user_records
}

async function main() {
    // const clients = await create_clients();
    // const employees = await create_employees();
    // const categories = await create_categories();
    // const services = await create_services();
    // const deals = await create_deals();
    // const vendors = await create_vendors();
    // const products = await create_products();
    await create_users();
    // console.log(clients, employees, categories, services, deals, vendors, products);
    
    prisma_client.$disconnect();
}

main();
