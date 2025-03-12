## Today:
- Implement authorization
- Implement user logs


## Done
- Use error handling for unique value constraint
- Check file types before processing the file. add safety checks
- Add error handling for file upload
  - handle max size error

## Things to do:

- Verify how errors are shown in build
 - set different file limits for images and videos
- Find a subset for PrismaClientKnownRequestError package as it is very heavy
- Start authentication from transactions_.product-transactions_.$id_.update
- Apply authentication to create and update route action functions. Also create loaders.
## Bugs:

- salesRecord create: paid amount is reset to amount_charged automatically

## frontend:

## backend
585697
## Tasks Done:

- fixed issues in CLientTransaction caused due to change in Service Sale Record schema
- add elements in navbar
- make clientTransactions the default in transactions
- added icons to sale record page.
- fix params issue in sales record page
- add payment cleared parameter to sale record page
- added show all employees functionality in employees page
- fix form overlapping navbar by changing h-screen to min-h-screen so that if the forms or anything else exceeds the screen height, it doesn't overlap with navbar
- seperated Client Transactions and Operational Expenses route form and table logic into seperate components
- create an All transaction page
- added pending value param to product sale record fetch form

## Improvements:

### Services:

1. save search parameters when going from "/services" to "/services/$id"
2. Disable buttons while form is submitting
3. Figure out how to provide data to refine function messages in zod

### Client:

- Add validation to clients route loader

### Client Transactions:

- Replace table in Client Transaction create to use SalesRecordTableComponent

## Update logic:

- users/:id page => Can only update userName, fname, lname. User clearance must be higher or equal to owner
- profile page => Can update password too.
  Owner can update manager and worker information and also disbale their accounts.
  Admin can update every role information or disbale account.

Sections that need fixing:

## Delete Files:

remove route client.\_id.transactions
app/server/utilityFunctions
components/Entity.tsx

## Other information

### Prompt for replacing error instances with Response:

In the files selected in the working set, search loader and action functions for thrown error instances: "throw new Error("<Error Message>") and replace them with the following:
throw new Response("<Error Message>", {
status: errorStatus,
statusText: "<statusText>"
});
Replace:
Error Message: with the message in error instance
status: with an appropriate status for example 400 for bad user input, 404 for data not found etc.
statusText: with an appropriate Text for status

## Original Lines in package.json:

    "dev": "remix vite:dev",
    "start": "NODE_OPTIONS='--import ./instrumentation.server.mjs' remix-serve ./build/server/index.js",




