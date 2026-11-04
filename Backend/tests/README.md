# Testing

## Testing environment

The testing environment generates two temporary test databases, which are used by the unit tests and integration tests. The databases are automatically generated upon starting up the tests with the test command: **npm run test**. After the tests have run the databases are dropped automatically. Unit tests and integration tests are run in their own projects and environments, this is to avoid possible conflicts between the tests. The test enivronment and the tests themselves have been made using vitest and supertest.