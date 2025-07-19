# Maria's Atelier Backend App

## Description

The app is built with `Nest.JS` framework 
It app provides the following backend functionality for the frontend `Maria's Atelier` app (https://github.com/mlatysheva/marias-art-atelier):
- CRUD functionality for creating, editing and deleting paintings 
- Cookie-based authentication using `passport` library
- Password protection using `bcrypt` library
- Integration with `Stripe` payment system
- Websocket connection based on `socket.io` library to update available paintings in real time after a successful Stripe purchase
- `Postgres` database to maintain users and paintings
- `Prisma ORM` to build and maintain Postgres database schemas 
- `class` transformer and validator to implement validation of database types

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# connect stripe checkout endpoint
$ stripe listen --forward-to http://localhost:3001/checkout/webhook
```

### Running the app in more detail

After installing the dependencies with `npm install` and starting the app with `npm run start:dev`, your terminal should be showing successful logs:

![Logs in console](screenshots/console_logs.png)

Then open a new terminal and type the following command:
`stripe listen --forward-to http://localhost:3001/checkout/webhook`

This will open a stripe webhook endpoint to listen for events coming from the Stripe checkout session:

![Stripe checkout webhook](screenshots/stripe_events_webhook.png)

Some endpoints tested with Postman:

Post request to `/users` to create a new user:

![Create a new user](screenshots/signup_new_user.png)

Post request to `/auth/login` to sign in a user:

![Login a user](screenshots/login_user.png)

Get request to `paintings` to get all available paintings:

![Get all paintings](screenshots/get_paintings.png)

Post request to `paintings` to add a new painting, with invalid entries:

![Add a new painting with validation](screenshots/validation_new_painting.png)

Post request to Stripe events webhook:

![Stripe checkout webhook](screenshots/stripe_checkout_session.png)

The `paintings` table in PG Admin:

![Paintings table in PG Admin](screenshots/pg_admin_paintings_table.png)
