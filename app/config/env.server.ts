type Environment = "development" | "test" | "staging" | "production";

interface EnvConfig {
    VERSION: string;
    PHONE_NUMBER_ID: string;
    ACCESS_TOKEN: string;
    WEBHOOK_VERIFY_TOKEN: string;
    WP_DAILY_LIMIT: string;
    UPSTASH_WP_MESSAGE_LOG_DB_TOKEN: string;
    DATABASE_URL: string;
    ENV: Environment;
}

function getEnvConfig(): EnvConfig {
    // const env = process.env.NODE_ENV as Environment || "development";

    // Validate required environment variables
    const requiredVars = [
        "VERSION",
        "PHONE_NUMBER_ID",
        "ACCESS_TOKEN",
        "WEBHOOK_VERIFY_TOKEN",
        "WP_DAILY_LIMIT",
        "UPSTASH_WP_MESSAGE_LOG_DB_TOKEN",
        "DATABASE_URL",
    ];

    for (const varName of requiredVars) {
        if (!process.env[varName]) {
            throw new Error(
                `Missing required environment variable: ${varName}`,
            );
        }
    }

    return {
        VERSION: process.env.VERSION!,
        PHONE_NUMBER_ID: process.env.PHONE_NUMBER_ID!,
        ACCESS_TOKEN: process.env.ACCESS_TOKEN!,
        WEBHOOK_VERIFY_TOKEN: process.env.WEBHOOK_VERIFY_TOKEN!,
        WP_DAILY_LIMIT: process.env.WP_DAILY_LIMIT!,
        UPSTASH_WP_MESSAGE_LOG_DB_TOKEN: process.env
            .UPSTASH_WP_MESSAGE_LOG_DB_TOKEN!,
        DATABASE_URL: process.env.DATABASE_URL!,
        ENV: "production",
    };
}

export const env = getEnvConfig();
