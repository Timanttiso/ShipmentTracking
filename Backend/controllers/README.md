# Controllers

Controllers are the first layer in the API structure. Controllers expose endpoints for the clients. Every controller exposes endpoints for specific backend resources. The controllers export a router, which is used in app.js.

## Role

* Expose endpoints
* Contains logic for when the endpoint is called
* Calls the right services to do the required actions for that endpoint
* Sends back a response to the calling client