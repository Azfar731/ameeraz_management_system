import { Client } from "@prisma/client";
import axios from "axios";
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
        } catch (err: any) {
            if (err.response) {
                console.log("API Error Response:");
                console.log("Status:", err.response.status);
                console.log("Data:", err.response.data);
            } else if (err.request) {
                console.log("No Response Received:", err.request);
            } else {
                console.log("Error Message:", err.message);
            }
            // console.log("Request Config:", err.config);
            return null;
        }
    });
}

function getTextMessageInput(
    { recipient }: { recipient: string },
) {
    return JSON.stringify({
        "messaging_product": "whatsapp",
        "to": recipient,
        "type": "template",
        "template": {
            "name": "hello_world",
            "language": {
                "code": "en_US",
            },
        },
    });
}

function getInstaTemplateMessageInput(
    { recipient, variablesArray}: {
        recipient: string;
        variablesArray: {key: string, value: string}[];

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

function convertMobileNumber(mobileNumber: string): string {
    // Validate the input
    if (!/^0\d{10}$/.test(mobileNumber)) {
        throw new Error("Invalid mobile number format. It must be 11 digits long and start with '0'.");
    }
    
    // Replace the first "0" with "92"
    return mobileNumber.replace(/^0/, "92");
}

type TemplateFunction = (props: { recipient: string; variablesArray: {key: string,value:string}[]} ) => string;

// Define your dictionary with string keys and function values
const templates: { [key: string]: TemplateFunction } = {
    "deals_insta_link": getInstaTemplateMessageInput, // Make sure getInstaTemplateMessageInput matches the TemplateFunction type
};

// sendMultipleMessages function
async function sendMultipleMessages({
    template_name,
    clientsList,
    imageUrl,
    variablesArray,
}: {
    template_name: string;
    clientsList: Client[];
    imageUrl?: string;
    variablesArray: {key: string, value: string}[]; // Allows additional properties for each template
}) {
    if (clientsList.length < 1) {
        console.log("Empty list sent to sendMultipleMessages");
        return null;
    }

    // Ensure the template_name exists in the dictionary
    const templateFunction = templates[template_name];
    if (!templateFunction) {
        throw new Error(`Template function not found for template_name: ${template_name}`);
    }

    
    // Generate messages using the template function
    const messages = clientsList.map((client) =>
        templateFunction({
            recipient: convertMobileNumber(client.client_mobile_num),
            variablesArray: imageUrl? [{key: "imageUrl", value: imageUrl}, ...variablesArray]: variablesArray,
        })
    );

    const responses = await Promise.all(messages.map((msg) => sendMessage(msg)));

    const nullCount = responses.filter((resp) => resp === null).length;

    return nullCount;
}


export { getInstaTemplateMessageInput, getTextMessageInput, sendMessage, sendMultipleMessages };
