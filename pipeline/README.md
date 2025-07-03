# Pipeline

This directory provides an ETL pipeline for a community driven API to a MongoDB collection in the cloud.

## Config

This pipeline relies upon environment variables. For local development I have used a `.env` file:
```sh
DB_CONN_STRING=<MONGO_CONNECTION_STRING>
DB_NAME=<NAME_OF_DB_IN_MONGO>
DB_COLLECTION=<NAME_OF_COLLECTION_IN_DATABASE>
```

## Pipeline Script

This is the core of the project. The script can be ran across the pages of the community API it takes from. As of writing that API has 10 pages of data on it's main endpoint we query. You can differentiate between target pages by defining them in the start and end options.
- First Page Run: `python pipeline.py --start 0 --end 1`
- Multiple Page Run: `python pipeline.py --start 0 --end 10`

The script takes data from a community hosted API and saves that as documents inside of MongoDB. The documents contain such information as object name, description and image url for a number of tanks, planes, boats and helicopters.

## Extract

- `extract.py` provides methods for extracting information from a community driven api.
- The api is documented [here](https://wtvehiclesapi.sgambe.serv00.net/docs/#/).
- The full module behavior is accessed through the `extract` method and should be imported as such: `from extract import extract`.
- Run `python extract.py` to save an example of the api response to a file named `example_response.json`.

## Transform

- `transform.py` provides methods for transforming data from the api into an expected data format being a DataFrame.
- The module provides the `transform` method as a collection of its full data transformation.
- This method groups the data by land, air or sea vehicle and removes any data we are not uploading to MongoDB.
- The module also removes any data that is inaccurate or missing key data points we require.
- The module scrapes the [War Thunder Wiki](https://wiki.warthunder.com/) for human friendly names and descriptions for users.
- Run `python extract.py` to save an example transformed DataFrame as a csv file named `example_df.csv`.

## Load

- `load.py` provides methods for loading the data from the api as a DataFrame into MongoDB.
- The module loads the data as json documents into MongoDB.
- On each upload the module checks for duplicate _id values and on duplication skips the current document.
- The module provides a single entrypoint method `load` which runs it's full suite.
- Run `python load.py` to load an example subset of data to a MongoDB instance defined in your .env file.

# Tests

Each module and script in this directory has an associated test file with the naming convetnion of `test_<MODULE_NAME>.py`. To run these tests ensure pytest is installed which if you followed my installation steps it will be.

Then run:

`pytest -vvx`

 OR

`pytest <TARGET-TEST-FILE> -vvx`