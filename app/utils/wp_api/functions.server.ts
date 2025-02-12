import { Client } from "@prisma/client";
import axios from "axios";
import Bottleneck from "bottleneck";
import { getTemplateByName } from "../templates/db.server";
import { TemplateWithRelations } from "../templates/types";

// type TemplateFunctionWithVariables = (
//     props: {
//         client: Client;
//         variablesArray: { key: string; value: string; type: string }[];
//     },
// ) => string;

const limiter = new Bottleneck({
    minTime: 1000 / 80, // 80 requests per second
    maxConcurrent: 80,
});

async function sendMessage(data: string) {
    const config = {
        method: "post",
        url: `https://graph.facebook.com/${process.env.VERSION}/${process.env.PHONE_NUMBER_ID}/messages`,
        headers: {
            "Authorization": `Bearer ${process.env.ACCESS_TOKEN}`,
            "Content-Type": "application/json",
        },
        data: data,
    };

    return limiter.schedule(async () => {
        try {
            const resp = await axios(config);
            return resp;
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response) {
                console.log("API Error Response:");
                console.log("Status:", err.response.status);
                console.log("Data:", err.response.data);
            } else {
                console.log("Non-Axios Error:", err);
            }
            return null;
        }
    });
}

async function sendFreeFormMessage(
    { recipient, msg }: { recipient: string; msg: string },
) {
    const data = JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipient,
        type: "text",
        text: {
            preview_url: true,
            body: msg,
        },
    });
    return await sendMessage(data);
}

// sendMultipleMessages function
async function sendMultipleMessages({
    template_name,
    clientsList,
    headerValue,
    variablesArray,
}: {
    template_name: string;
    clientsList: Client[];
    headerValue?: string;
    variablesArray: { key: string; value: string; type: string }[]; // Allows additional properties for each template
}) {
    if (clientsList.length < 1) {
        throw new Error("Empty List sent to sendMultipleMessages funcion");
    }
    // Ensure the template_name exists in the dictionary
    // let messages: string[] = [];
    const template = await getTemplateByName(template_name);
    if (!template) {
        throw new Error(`NO template found with name ${template_name}`);
    }

    const messages = clientsList.map((client) => {
        const completeVariablesArray = _generateVariablesArray({
            client,
            template,
            variablesArray,
            headerValue,
        });
        return _getDynamicTemplateBody({
            recipient: _convertMobileNumber(client.client_mobile_num),
            template,
            variablesArray: completeVariablesArray,
        });
    });

    const responses = [];
    for (const msg of messages) {
        // await _delay(100);
        responses.push(await sendMessage(msg));
    }

    // const responses = await Promise.all(messages.map(async (msg) => {
    //     await _delay(1000);
    //     return await sendMessage(msg);
    // }));

    // const responses = await Promise.all(
    //     messages.map((msg) => sendMessage(msg)),
    // );
    const nullCount = responses.filter((resp) => resp === null).length;

    return nullCount;
}

// function getInstaTemplateMessageInput(
//     { client, variablesArray }: {
//         client: Client;
//         variablesArray: { key: string; value: string; type: string }[];
//     },
// ) {
//     return JSON.stringify({
//         "messaging_product": "whatsapp",
//         "to": _convertMobileNumber(client.client_mobile_num),
//         "type": "template",
//         "template": {
//             "name": "deals_insta_link",
//             "language": {
//                 "code": "en_GB",
//             },
//             "components": [
//                 {
//                     "type": "header",
//                     "parameters": [
//                         {
//                             "type": "image",
//                             "image": {
//                                 "link": variablesArray[0].value,
//                             },
//                         },
//                     ],
//                 },
//                 {
//                     "type": "body",
//                     "parameters": [
//                         {
//                             "type": "text",
//                             "parameter_name": "customer_fname",
//                             "text": client.client_fname,
//                         },
//                     ],
//                 },
//             ],
//         },
//     });
// }

// function getMessageInput(
//     { template_name, recipient }: { template_name: string; recipient: string },
// ) {
//     return JSON.stringify({
//         "messaging_product": "whatsapp",
//         "to": recipient,
//         "type": "template",
//         "template": {
//             "name": template_name,
//             "language": {
//                 "code": "en_GB",
//             },
//         },
//     });
// }

// Define your dictionary with string keys and function values
// const templatesWithVariables: { [key: string]: TemplateFunctionWithVariables } =
//     {
//         "deals_insta_link": getInstaTemplateMessageInput, // Make sure getInstaTemplateMessageInput matches the TemplateFunction type
//     };

// function for creating variables array
function _generateVariablesArray({
    client,
    template,
    variablesArray,
    headerValue,
}: {
    client: Client;
    template: TemplateWithRelations;
    variablesArray: {
        key: string;
        value: string;
        type: string;
    }[];
    headerValue?: string;
}) {
    const newVariables = template.variables.filter((variable) =>
        variable.client_property !== "none"
    );
    const newVariablesArray = newVariables.map((variable) => ({
        key: variable.name,
        value: variable.client_property !== "none"
            ? String(client[variable.client_property])
            : "",
        type: variable.type,
    }));
    const modifiedArray = [];

    if (template.header_type !== "none" && headerValue) {
        modifiedArray.push({
            key: template.header_var_name,
            value: headerValue,
            type: template.header_type,
        });
    }

    modifiedArray.push(...variablesArray, ...newVariablesArray);

    return modifiedArray;
}

//function for generating message body for templates with variables:
function _getDynamicTemplateHeader(
    template: TemplateWithRelations,
    variablesArray: { key: string; value: string; type: string }[],
) {
    if (template.header_type === "none") {
        return undefined;
    }

    return template.header_type === "text"
        ? {
            type: "header",
            parameters: [
                {
                    type: "text",
                    parameter_name: template.header_var_name,
                    text: variablesArray[0].value,
                },
            ],
        }
        : {
            type: "header",
            parameters: [
                {
                    type: template.header_type,
                    [template.header_type]: {
                        link: variablesArray[0].value,
                    },
                },
            ],
        };
}

function _getDynamicTemplateBodyContent(
    template: TemplateWithRelations,
    variablesArray: { key: string; value: string; type: string }[],
) {
    if (template.variables.length === 0) {
        return undefined;
    }

    const parameters = variablesArray.map((variable) => ({
        type: "text",
        parameter_name: variable.key,
        text: variable.value,
    }));

    return {
        type: "body",
        parameters: parameters,
    };
}

function _getDynamicTemplateBody({
    template,
    recipient,
    variablesArray,
}: {
    template: TemplateWithRelations;
    recipient: string;
    variablesArray: { key: string; value: string; type: string }[];
}) {
    const header = _getDynamicTemplateHeader(template, variablesArray);
    const body = _getDynamicTemplateBodyContent(
        template,
        variablesArray.slice(1),
    );

    const components = [];
    if (header) components.push(header);
    if (body) components.push(body);

    const msg = JSON.stringify({
        messaging_product: "whatsapp",
        to: recipient,
        type: "template",
        template: {
            name: template.name,
            language: {
                code: "en_GB",
            },
            components: components,
        },
    });
    console.log("Message BODY:\n", msg);
    return msg;
}

//util functions
function _convertMobileNumber(mobileNumber: string): string {
    // Validate the input
    if (!/^0\d{10}$/.test(mobileNumber)) {
        throw new Error(
            "Invalid mobile number format. It must be 11 digits long and start with '0'.",
        );
    }

    // Replace the first "0" with "92"
    return mobileNumber.replace(/^0/, "92");
}



// function _delay(ms: number) {
//     return new Promise((resolve) => setTimeout(resolve, ms));
// }

export { sendFreeFormMessage, sendMultipleMessages };
