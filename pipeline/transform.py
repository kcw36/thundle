"""Module for transforming api response into refined DataFrame."""

from json import loads

from pandas import DataFrame

def get_df_from_data(raw: list[dict]) -> DataFrame:
    """Return dataframe from list of dictionaries."""
    return DataFrame(raw)


def get_refined_frame(data: DataFrame) -> DataFrame:
    """Return dataframe with only required data included."""
    cols_to_keep = [
        "identifier", "country", "vehicle_type", "era",
        "realistic_br", "realistic_ground_br", "event", "release_date",
        "is_premium", "is_pack", "on_marketplace", "squadron_vehicle", "images"
    ]
    refined = data[cols_to_keep]
    rename_cols = {
        "identifier": "name", "event": "is_event",
        "on_marketplace": "is_marketplace", 
        "squadron_vehicle": "is_squadron", 
        "images": "image_url", "era": "tier"
    }
    renamed = refined.rename(columns=rename_cols)
    return renamed


def clean_dataframe(data: DataFrame) -> DataFrame:
    """Return cleaned dataframe without empty or invalid data points."""
    return data


def transform(raw: list[dict]) -> DataFrame:
    """Return cleaned and refined dataframe from raw data."""
    df = get_df_from_data(raw)
    df = get_refined_frame(df)
    df = clean_dataframe(df)
    return df


if __name__ == "__main__":
    with open("example_response.json", "r", encoding="utf-8") as f:
        data = loads(f.read())
    print(transform(data).head())