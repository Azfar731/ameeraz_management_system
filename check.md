## Bugs

## Todo:

- Add authentication to new pages
- Test the app
- Change colour scheme
- prepare a read me file for explaining the project

- Figure out a way to to remove password in seeds file from git history
- In users page, don't show users greater user own level

## Today:

- Add graphs
  - Client
    - New vs Repeating Clients: Pie
    - Areas: Pie
  - Employees
    - Employee Share graph: Bar graph
    - Calculate salaries
  - Deals:
    - Most taken deals(Pie)
    - Most revenue deals (Pie)
    - Info related to each deal(Number of times taken, total revenue, Top 10 client areas(clients who took the deal) )
  - Services
    - Most taken Services (Pie)
    - Most revenue services (Pie)
    - Info related to each service(Number of times taken, total revenue, Top 10 client areas(clients who took the service))

## Things to do:

- set different file limits for images and videos

## Bugs:

- salesRecord create: paid amount is reset to amount_charged automatically(in dev only cause useEffect runs twice on react strict mode)
- Categories id route => Messes up the position of Edit button, when no service is present

## Improvements:

1. Open id tabs in new windows
2. Add defer and suspense to make things load quicker
3. Add filter functionality while choosing pending transactions on creaate client transaction.
4. Display no records found when the fetch results show return empty array
5. Implement rate limit on number of login attempts

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

## Implemented User logs in:

- Sale reecord
- Product Sale record
- Product
- Client
- Transactions(product,client,expenses)

## Functionalities Tested

- Client (create,update)
- Employee (create,update)
- Services (create,update) //Service can be of price 0
- Deals (create, update)
- SalesRecord(create,update)
- Trasaction
  - Client Transaction(create,update)
- Vendor(creaate,update)

- Insights
  - Index(Client)
  - Deals
  - Services
- Employees

- dashboard.insights
  - dashboard.insights.\_index(clients)
  - dashboard.insights.deals
  - dashboard.insights.services
- dashboard.employees

Component:
Pie Chart
