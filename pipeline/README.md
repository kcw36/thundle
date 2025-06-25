# Pipeline

## Config

This pipeline relies upon environment variables. For local development I have used a `.env` file:
```sh
AWS_BUCKET=<AWS_BUCKET_NAME>
AWS_ACCESS_KEY=<ACCESS_KEY_WITH_LOAD_FILE_PERMISSIONS>
AWS_SECRET_ACCESS_KEY=<SECRET_ACCESS_KEY_WITH_LOAD_FILE_PERMISSIONS>
```

## Extract

- `extract.py` provides methods for extracting information from a community driven api.
- The api is documented [here](https://wtvehiclesapi.sgambe.serv00.net/docs/#/).
- The full module behavior is accessed through the `extract` method and should be imported as such: `from extract import extract`.
- Run `python extract.py` to save an example of the api response to a file named `example_response.json`.

## Transform

- `transform.py` provides methods for transforming data from the api into an expected data format being a DataFrame.
- The module provides the `transform` method as a collection of its full data transformation.
- This method groups the data by land, air or sea vehicle and removes any data we are not uploading to AWS.
- The module also removes any data that is inaccurate or missing key data points we require.
- Run `python extract.py` to save an example transformed DataFrame as a csv file named `example_df.csv`.

## Load

- `load.py` provides methods for loading the data from the api as a DataFrame into the cloud.
- The module loads the data as partitioned parquet files into three keys made around the object mode.
- The module provides a single entrypoint method `load` which runs it's full suite.
- Run `python load.py` to load an example subset of data to an S3 bucket defined in environment.