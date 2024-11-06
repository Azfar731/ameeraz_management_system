import { create_client_fn } from "~/.server/models/client.model";
import { faker } from "@faker-js/faker";

const createClient = () =>
    create_client_fn({
        client_fname: faker.person.firstName(),
        client_lname: faker.person.lastName(),
        client_mobile_num: "0" + faker.string.numeric(10),
        client_area: faker.person.jobArea(),
    });

export { createClient };
