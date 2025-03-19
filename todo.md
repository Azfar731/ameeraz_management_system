## Today:

- Resolve styles not loading in vercel
- Implement user logs



## Done

- Use error handling for unique value constraint
- Check file types before processing the file. add safety checks
- Add error handling for file upload
  - handle max size error
- Find a subset for PrismaClientKnownRequestError package as it is very heavy
- Verify how errors are shown in build

## Things to do:

- set different file limits for images and videos

## Bugs:

- salesRecord create: paid amount is reset to amount_charged automatically(in dev only cause useEffect runs twice on react strict mode)
- Categories id route => Messes up the position of Edit button, when no service is present
## Improvements:

1. Open id tabs in new windows
2. Add defer and suspense to make things load quicker
### Services:

1. save search parameters when going from "/services" to "/services/$id"
2. Figure out how to provide data to refine function messages in zod

### Users 
- Allow the same user to edit his/her own name

## Sections that need fixing:

## Other information

### Known bugs:

Compact table has a value of 1 < z-index > 10, so it sometimes obsturcuts the Select menu

## Original Lines in package.json:

    "dev": "remix vite:dev",
    "start": "NODE_OPTIONS='--import ./instrumentation.server.mjs' remix-serve ./build/server/index.js",

## Steps for Production

- create user in db
- create triggers and function in db
