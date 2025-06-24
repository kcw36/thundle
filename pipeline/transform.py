"""Module for transforming api response into refined DataFrame."""

from json import load

from pandas import DataFrame

def get_df_from_data(raw: list[dict]) -> DataFrame:
    """Return dataframe from list of dictionaries."""


def get_refined_frame(data: DataFrame) -> DataFrame:
    """Return dataframe with only required data included."""


def clean_dataframe(data: DataFrame) -> DataFrame:
    """Return cleaned dataframe without empty or invalid data points."""


def transform(raw: list[dict]) -> DataFrame:
    """Return cleaned and refined dataframe from raw data."""


if __name__ == "__main__":
    with open("example_response.json", "r", encoding="utf-8") as f:
        data = load(f.read())
    print(transform(data))