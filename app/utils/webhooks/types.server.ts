type ErrorDetails = {
    code: string;
    error_data: {
        details: string;
    };
};

type Status = {
    status: string;
    timestamp: string;
    recipient_id: string;
    errors?: ErrorDetails[];
};

type TextMessage = {
    from: string;
    timestamp: string;
    type: "text";
    text: {
        body: string;
    };
};

type ButtonMessage = {
    from: string;
    timestamp: string;
    type: "button";
    button: {
        payload: string;
        text: string;
    };
};

type Message = TextMessage | ButtonMessage;

type ChangeValue = {
    messages?: Message[];
    statuses?: Status[];
};

type EntryChange = {
    field: string;
    value: ChangeValue;
};

type Entry = {
    changes: EntryChange[];
};

type WebhookObj = {
    object: string;
    entry: Entry[];
};

export type { WebhookObj };
