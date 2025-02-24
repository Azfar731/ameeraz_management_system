class WP_API_Error extends Error {
    constructor(message: string) {
        super(message);
        this.name = "WP_API_Error";
    }
}

class WP_ServiceError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "MessageServiceError";
    }
}


export {WP_API_Error, WP_ServiceError   }