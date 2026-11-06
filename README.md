# ShipmentTracking

This is a repository for a course called Capstone 2. In this project we are creating a shipment tracking web application. The idea is that you will be able to follow your shipments in real time through this application. 

## Installation and setup

### Before continuing you need

* PostgreSQL
* npm
* node.js

### Backend

After cloning the repository to your local device you must run the following command in the backend folder of the project.

```
npm install
```
This will download all the needed modules to run the backend API. This command also runs an automated script that will create the database, which the API uses. The script also will create a .env file, which you need. The .env file is a private file that contains enviromental variables that the API uses, it contains secret information and you should not share with anyone. The .env file will look similar to this.

```
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=shipmenttracking
DB_USER=postgres
DB_PASSWORD=YourPassword
JWT_SECRET=GeneratedSecret
```
You need to swap the DB_PASSWORD to your postgre password. If you do not have the .env file before running the install command the auto generate .env file will have a pre generated JWT_SECRET. If you created the .env file yourself you must generate your own secret. To run the backend API use the following command in the backend folder.
```
npm run dev
```
This will run the API in the development environment. This will also start up the MQTT listener service.

### Frontend

After cloning the repository to your local device and setting up the backend you must run the same install command again in the frontend folder of the project.

```
npm install
```
This will download all the needed modules to run the frontend. To start the frontend you must run the same run command in the frontend as you did in the backend.
```
npm run dev
```
The terminal will display where the frontend started running and you can open the link to start using the web app.

## Frontend

### Tech Stack
* React.js 19 — UI framework
* React compiler — build-time optimization tool
* Vite — Build tool and dev server
* Leaflet — library for building maps (picking destination location)
* TypeScript

## Backend

### Tech Stack

### Runtime and Web framework

* Node.js — Javascript run time environment
* Express.js — Node.js web application framework

### Authentication / Security

* jsonwebtoken.js — Module to implement JSON web tokens
* bcrypt — Password hashing function
* express-rate-limit — Basic limiter middleware for express.js

### Database / Query Builder

* PostgreSQL — Object-relational database management system
* knex.js — SQL query builder

### MQTT service

* mqtt.js — MQTT client library

### Testing

* vitest — Testing framework
* supertest — Node.js API testing library

### Misc

* dotenv — Loads enviromental variables
* cross-env — Allows using environmental variables across multiple OSs
* nodemon — Development tool for restarting application upon a code change
* cookie-parser — Cookie parser library

---
### Available API endpoints

| Method | Endpoint                             | Description                                                    |
|--------|--------------------------------------|----------------------------------------------------------------|
|GET     |  /api/auth/me                        |Retrieves current users info                                    |
|POST    |  /api/auth/register                  |Registers a new user                                            |
|POST    |  /api/auth/login                     |Logs in a user                                                  |
|POST    |  /api/auth/refresh                   |Refreshes the user's access token with a refresh token          |
|POST    |  /api/auth/logout                    |Removes the user's refresh token, used when logging out         |
|PATCH   |  /api/auth/settings                  |Updates the user's information and settings                     |
|PATCH   |  /api/auth/settings/change-password  |Allows the user to change their password                        |
|DELETE  |  /api/auth/settings/delete-account   |Deletes the account of the current user                         |
||||
|GET     |  /api/shipments/                     |Retrieves all shipments for the current user                    |
|GET     |  /api/shipments/status/:status       |Retrieves all shipments for the current user by status          |
|GET     |  /api/shipments/shipment/:id         |Retrieves a specific status                                     |
|POST    |  /api/shipments/add-shipment         |Adds a shipment for the current user                            |
|PATCH   |  /api/shipments/shipment/:id         |Updates a specific shipment's info                              |
|PATCH   |  /api/shipments/shipment/status/:id  |Updates a specific shipment's status                            |
|DELETE  |  /api/shipments/shipment/:id         |Deletes a specific shipment                                     |
||||
|GET     |  /api/destinations/                  |Retrieves all destinations for the current user                 |
|GET     |  /api/destinations/destination/:id   |Retrieves a specific destination                                |
|POST    |  /api/destinations/add-destination   |Adds a destination for the current user                         |
|PATCH   |  /api/destinations/destination/:id   |Updates a destination                                           |
|DELETE  |  /api/destinations/destination/:id   |Deletes a destination                                           |
||||
|GET     |  /api/ships/                         |Retrieves all ships for the current user                        |
|GET     |  /api/ships/:id                      |Retrieves information of one ship                               |
|POST    |  /api/ships/add-ship                 |Adds a ship to the follow list of the user and adds the ship if it does not exist |
|DELETE  |  /api/ships/unfollow/:id             |Deletes the link between the user and the chosen ship           |


### Backend project structure
The backend API project follows a Controller-Service-Model pattern. Below you can see the whole project structure for the backend side of the application.
```
backend/
├── app.js                                          # Backend main entry point
├── index.js                                        # Boots up the server and loads app.js
├── knexfile.js                                     # Contains configurations for knex
├── package.json
├── vitset.config.js                                # Configuration file for vitest
├── .env                                            # Secret environmental variable file
├── controllers/                                    # Controllers expose endpoints for clients to call
│   ├── destinationsController.js
│   ├── shipmentsController.js
│   ├── shipsController.js
│   ├── usersController.js
│   └── README.md
├── db/
│   ├── migrations/                                 # Migrations setup the database structure and apply changes to it
│   │   └── ...
│   └── db.js                                       # Contains the primary database instance used in the models
├── models/                                         # Models interact with the database
│   ├── destination.js
│   ├── refreshToken.js
│   ├── ship.js
│   ├── shipment.js
│   ├── user_ships.js
│   ├── users.js
│   └── README.md
├── mqtt/
│   ├── mqtt.client.js                              # Creates the MQTT client
│   ├── mqtt.index.js                               # Starts the MQTT worker
│   ├── mqtt.messageHandler.js                      # Handles recieved MQTT messages
│   └── mqtt.subscriptionManager.js                 # Handles MQTT topic subscription
├── scripts/
│   ├── createDatabase.js                           # Creates the database during project setup if it does not exist
│   └── createTestDatabase.js                       # Creates two temporary test databases when running tests
├── services/                                       # Services are used to house business logic
│   ├── destinationService.js
│   ├── refreshTokenService.js
│   ├── shipmentService.js
│   ├── shipService.js
│   ├── userService.js
│   └── README.md
├── tests/
│   ├── helpers/
│   │   └── authHelper.js                           # A helper used in integration tests to avoid authentication issues
│   ├── integration/                                # A folder containing all integration tests
│   │   ├── destinationsIntegrations.test.js
│   │   └── usersIntegrations.test.js
│   ├── setup/
│   │   ├── env.js                                  # Overwrites .env variables with values needed in testing
│   │   ├── globalSetup.integration.js              # Glonal setup for integration tests
│   │   └── globalSetup.unit.js                     # Global setup for unit tests
│   ├── unit/                                       # A folder containing all unit tests by type
│   │   ├── controllers/                            # Controller unit tests
│   │   │   ├── destinationsControllerUnit.test.js
│   │   │   └── usersControllerUnit.test.js
│   │   ├── models/                                 # Model unit tests
│   │   │   └── destinationUnit.test.js
│   │   └── services/                               # Service unit tests
│   │       └── destinationServiceUnit.test.js
│   └── README.md
├── utils/                                          # Misc utilities
│   ├── ApiError.js                                 # Defined API error
│   ├── auth.js                                     # Authentication middleware
│   ├── config.js                                   # Configuration file
│   ├── logger.js                                   # Logger middleware
│   ├── LoginLimiter.js                             # Login limiter middleware
│   └── tokens.js                                   # Token related methods
└── README.md
```
---