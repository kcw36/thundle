# Pipeline

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