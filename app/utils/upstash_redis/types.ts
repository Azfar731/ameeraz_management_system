type failed_message = {
    mobile_num: string;
    status: string;
    timestamp: string;
    errors?: { description: string; code: string }[];
};

export type { failed_message };
