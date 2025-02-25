import * as Sentry from "@sentry/remix";

Sentry.init({
    dsn: "https://58c7e19649f0cbbd6b2b94f356bbdb68@o4508878615937024.ingest.de.sentry.io/4508878626488400",
    tracesSampleRate: 1
})