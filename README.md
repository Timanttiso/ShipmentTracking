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
This will run the API in the development environment.

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
The frontend is made using typescript.

## Backend

### Tech Stack

### Runtime and Web framework

* Node.js
* Express.js

### Authentication

* jsonwebtoken.js 

### Database / Query Builder

* PostgreSQL
* knex.js

### MQTT service



### Misc

* dotenv
* cross-env
* bcrypt
* nodemon

---
### Available API endpoints

| Method | Endpoint                             | Description                                                    |
|--------|--------------------------------------|----------------------------------------------------------------|
|GET     |  /api/auth/me                        |Retrieves current users info                                    |
|POST    |  /api/auth/register                  |Registers a new user                                            |
|POST    |  /api/auth/login                     |Logs in a user                                                  |
|PATCH   |  /api/auth/settings                  |Updates the user's information and settings                     |
||||
|GET     |  /api/shipments/                     |Retrieves all shipments for the current user                    |
|GET     |  /api/shipments/status/:status       |Retrieves all shipments for the current user by status          |
|GET     |  /api/shipments/shipment/:id         |Retrieves a specific status                                     |
|POST    |  /api/shipments/add-shipment         |Adds a shipment for the current user                            |
|PATCH   |  /api/shipments/shipment/:id         |Updates a specific shipment's info                              |
|PATCH   |  /api/shipments/shipment/status/:id  |Updates a specific shipment's status                            |
||||
|GET     |  /api/destinations/                  |Retrieves all destinations for the current user                 |
|GET     |  /api/destinations/add-destination   |Adds a destination for the current user                         |


---