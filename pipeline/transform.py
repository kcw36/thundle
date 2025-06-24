"""Module for transforming api response into refined DataFrame."""

from json import loads
from re import sub

from pandas import DataFrame, to_datetime


def get_clean_plane_name(name: str) -> str:
    """Return clean and human-readable plane name from identifier."""
    country_list = {"usa", "ussr", "china", "germany", "britain", "france", "italy", "japan", "sweden", "israel"}

    name = name.lower()
    parts = name.split('_')

    country = None
    if parts and parts[-1] in country_list:
        country = parts.pop().upper()

    result_parts = []

    for part in parts:
        sub_parts = part.split('-')
        new_sub_parts = []
        for sub in sub_parts:
            if re.search(r'\d', sub):
                new_sub_parts.append(sub.upper())
            elif sub.isalpha():
                new_sub_parts.append(sub.title())
            else:
                new_sub_parts.append(sub)
        result_parts.append('-'.join(new_sub_parts))

    result = ' '.join(result_parts)

    if country:
        result += f" [{country}]"

    return result


def get_name_from_wiki():
    """Return human friendly name from war thunder wiki by scraping the url."""


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
    refined = data[cols_to_keep].copy()

    refined["images"] = refined["images"].apply(lambda x: x.get("image") if isinstance(x, dict) else None)
    refined["event"] = refined["event"].apply(lambda x: True if x else False)
    refined["release_date"] = to_datetime(refined["release_date"], utc=True)

    vehicle_type_to_mode = {
        "fighter": "air",
        "assault": "air",
        "bomber": "air",
        "light_tank": "ground",
        "medium_tank": "ground",
        "heavy_tank": "ground",
        "spaa": "ground",
        "tank_destroyer": "ground",
        "attack_helicopter": "helicopter",
        "utility_helicopter": "helicopter",
        "destroyer": "naval",
        "battleship": "naval",
        "light_cruiser": "naval",
        "heavy_cruiser": "naval",
        "frigate": "naval",
        "boat": "naval",
        "heavy_boat": "naval"
    }
    refined["mode"] = refined["vehicle_type"].map(vehicle_type_to_mode)


    rename_cols = {
        "identifier": "name", "event": "is_event",
        "on_marketplace": "is_marketplace", 
        "squadron_vehicle": "is_squadron", 
        "images": "image_url", "era": "tier"
    }
    return refined.rename(columns=rename_cols)


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