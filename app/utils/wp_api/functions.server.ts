import { Client } from "@prisma/client";
import axios, { AxiosError } from "axios";
import Bottleneck from "bottleneck";

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

function getInstaTemplateMessageInput(
    { recipient, variablesArray }: {
        recipient: string;
        variablesArray: { key: string; value: string }[];
    },
) {
    return JSON.stringify({
        "messaging_product": "whatsapp",
        "to": recipient,
        "type": "template",
        "template": {
            "name": "deals_insta_link",
            "language": {
                "code": "en_GB",
            },
            "components": [
                {
                    "type": "header",
                    "parameters": [
                        {
                            "type": "image",
                            "image": {
                                "link": variablesArray[0].value,
                            },
                        },
                    ],
                },
                {
                    "type": "body",
                    "parameters": [
                        {
                            "type": "text",
                            "parameter_name": variablesArray[1].key,
                            "text": variablesArray[1].value,
                        },
                    ],
                },
            ],
        },
    });
}

function getMessageInput(
    { template_name, recipient }: { template_name: string; recipient: string },
) {
    return JSON.stringify({
        "messaging_product": "whatsapp",
        "to": recipient,
        "type": "template",
        "template": {
            "name": template_name,
            "language": {
                "code": "en_GB",
            },
        },
    });
}

function convertMobileNumber(mobileNumber: string): string {
    // Validate the input
    if (!/^0\d{10}$/.test(mobileNumber)) {
        throw new Error(
            "Invalid mobile number format. It must be 11 digits long and start with '0'.",
        );
    }

    // Replace the first "0" with "92"
    return mobileNumber.replace(/^0/, "92");
}

type TemplateFunctionWithVariables = (
    props: {
        recipient: string;
        client: Client;
        variablesArray: { key: string; value: string }[];
    },
) => string;

// Define your dictionary with string keys and function values
const templatesWithVariables: { [key: string]: TemplateFunctionWithVariables } =
    {
        "deals_insta_link": getInstaTemplateMessageInput, // Make sure getInstaTemplateMessageInput matches the TemplateFunction type
    };

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
    variablesArray?: { key: string; value: string }[]; // Allows additional properties for each template
}) {
    if (clientsList.length < 1) {
        console.log("Empty list sent to sendMultipleMessages");
        return null;
    }
    // Ensure the template_name exists in the dictionary
    let messages: string[] = [];
    if (variablesArray && variablesArray.length > 0) {
        const templateFunction = templatesWithVariables[template_name];
        if (!templateFunction) {
            throw new Error(
                `Template function not found for template_name: ${template_name}`,
            );
        }
        messages = clientsList.map((client) =>
            templateFunction({
                recipient: convertMobileNumber(client.client_mobile_num),
                client: client,
                variablesArray: headerValue
                    ? [
                        { key: "imageUrl", value: headerValue },
                        ...variablesArray,
                    ]
                    : variablesArray,
            })
        );
    } else {
        //send message without variables

        messages = clientsList.map((client) =>
            getMessageInput({
                recipient: convertMobileNumber(client.client_mobile_num),
                template_name,
            })
        );
    }

    const responses = await Promise.all(
        messages.map((msg) => sendMessage(msg)),
    );

    const nullCount = responses.filter((resp) => resp === null).length;

    return nullCount;
}

export { sendMessage, sendMultipleMessages };
