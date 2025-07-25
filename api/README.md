# Thundle

This directory provides an internal API for receiving information from the MongoDB.

## Config

This API relies upon environment variables. For local development I have used a `.env` file:
```sh
DB_CONN_STRING=<MONGO_CONNECTION_STRING>
DB_NAME=<NAME_OF_DB_IN_MONGO>
```

## Main Script

This is a FastAPI app that serves four endpoints:

- `/` this is the home endpoint providing minimal information about the API.
- `/docs` this is autogenerated by OpenAPI and provides usage information.
- `/random` this will return a random vehicle for that day.
- `/vehicles` this will return a list of vehicles.

Each endpoint has more information stored regarding query parameters and expected returns.

## Data

- `data.py` provides methods for interacting with the MongoDB data.
- Useful methods include checking  the database cache for results for that day and getting a list of objects from storage.

# Tests

Each module and script in this directory has an associated test file with the naming convention of `test_<MODULE_NAME>.py`. To run these tests ensure pytest is installed which if you followed my installation steps it will be.

Then run:

`pytest -vvx`

 OR

`pytest <TARGET-TEST-FILE> -vvx`