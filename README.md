# ShipmentTracking

This is a repository for a course called Capstone 2. In this project we are creating a shipment tracking web application. The idea is that you will be able to follow your shipments in real time through this application. 

## Installation and setup

### Before continuing you need

* PostgreSQL
* npm
* node.js

### Backend

After cloning the repository to your local device you must run the following command in the same folder.

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
```
You need to swap the DB_PASSWORD to your postgre password. To run the backend API use the following command.
```
npm run dev
```
This will run the API in the development environment.

### Frontend


## Frontend

The frontend is made using typescript.

## Backend

