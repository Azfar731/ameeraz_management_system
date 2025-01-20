import axios from "axios";

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
    { recipient, imageUrl, customer_fname }: {
        recipient: string;
        imageUrl: string;
        customer_fname: string;
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
                                "link": imageUrl,
                            },
                        },
                    ],
                },
                {
                    "type": "body",
                    "parameters": [
                        {
                            "type": "text",
                            "parameter_name": "customer_fname",
                            "text": customer_fname,
                        },
                    ],
                },
            ],
        },
    });
}

async function  getMessageStatus(id: string) {
    const data = {
        message_id: id
    };

    const config = {
        method: "get",
        url: `https://graph.facebook.com/${process.env.VERSION}/${process.env.PHONE_NUMBER_ID}/messages`,
        headers: {
            "Authorization": `Bearer ${process.env.ACCESS_TOKEN}`,
            "Content-Type": "application/json",
        },
        params: data,  // Use 'params' for GET request query parameters
    };

    try {
        const resp = await axios(config);
        return resp.data;  // Return the response data only
    } catch (err: any) {
        if (err.response) {
            console.error("API Error Response:");
            console.error("Status:", err.response.status);
            console.error("Error Message:", err.response.data.error.message || "No message provided");
            console.error("Error Type:", err.response.data.error.type || "No type provided");
            console.error("Error Code:", err.response.data.error.code || "No code provided");
            console.error("Trace ID:", err.response.data.error.fbtrace_id || "No trace ID provided");
        } else if (err.request) {
            console.error("No Response Received:", err.request);
        } else {
            console.error("Error Message:", err.message);
        }
        return null;
    }
}

export {
    getInstaTemplateMessageInput,
    getMessageStatus,
    getTextMessageInput,
    sendMessage,
};
