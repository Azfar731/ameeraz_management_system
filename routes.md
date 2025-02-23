# Routes:

/ => (salerecord.tsx)

## Service Sale Records:

- / => \_index.tsx

### Create

- /salerecord/create => salerecord.create
- /salerecord/create => salerecord.create.\_index
- /salerecord/create/part2 => salerecord.create.part2
- /salerecord/create/part3 => salerecord.create.part3

### View a single record

- salerecord/:id => salerecord.$id

### Update

- salerecord/:id/update => salerecord.$id.update

## Produdct Sale Recordsd:

- /productsalerecords => productsalerecords.tsx

### Create

- /productsalerecords/create => productsalerecords.create
- /productsalerecords/create => productsalerecords.create.\_index
- /productsalerecords/create/part2 => productsalerecords.create.part2
- /productsalerecords/create/part3 => productsalerecords.create.part3

### View a single record

- productsalerecords/:id => productsalerecords.$id

### Update

- productsalerecords/:id/update => productsalerecords.$id.update

## Client:

- /clients => clients.tsx

### Create:

- /clients/create => clients_.create.tsx


### View:
- /clients/:id => clients_.$id.tsx
    - /transactions
    - /sales


### Update:

- /clients/:id/update => clients_.$id_.update.tsx



## Category

- /cateogries => cateogries.tsx

### Create:

- /cateogries/create => categories_.create.tsx


### View:
- /cateogries/:id => categories_.$id.tsx
    - /transactions
    - /sales



## Product Transactions:
- /transactions/product-transactions => transactions.productTransactions
- /transactions/product-transactions/id => tranasactions.productTransactions_.$id
- /transactions/product-transactions/create => transaction.productTransactions_.create
- /transactions/product-transactions/create/product-sale-record-id => transaction.productTransactions_.create_.$product-sale-record-id
- /transactions/product-transactions/id/update => transactions.productTransactions_.$id_.update



## User routes

/users => view all users
/users/:id => view a single user
/users/:id/update => update the info about a user
/users/create => create a new user


Checks:
/users => Can only be accessed by owner or admin. Only sends users, lower than the current user level.
/users/:id => The user must be admin or higher level than the user they are viewing. If the user is viewing their own id, than they will be allowed to see it.
/users/:id/update => can update their own info or for the users below them. 
/users/create => owner is allowed to create accounts for manager or worker.

