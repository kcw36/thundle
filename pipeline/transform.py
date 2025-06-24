"""Module for transforming api response into refined DataFrame."""

from json import loads
from asyncio import run

from bs4 import BeautifulSoup
from aiohttp import ClientSession
from pandas import DataFrame, to_datetime, NA


def get_soup_from_wiki(url: str) -> str:
    """Return soup from war thunder wiki by scraping the url."""
    print("Getting soup for ", url)
    page =  get(url, timeout=10)
    return BeautifulSoup(page.content, "html.parser")


def get_name_from_soup(soup: BeautifulSoup) -> str:
    """Return name from html soup."""
    return soup.find("div", class_="game-unit_name")


def get_desc_from_soup(soup: BeautifulSoup) -> str:
    """Return description from html soup."""
    return soup.find("div", class_="game-unit_desc mb-3")


def get_df_from_data(raw: list[dict]) -> DataFrame:
    """Return dataframe from list of dictionaries."""
    return DataFrame(raw)


async def get_name_and_description(df: DataFrame) -> DataFrame:
    """Return DataFrame with name and description from wiki."""
    df["name"] = df["name"].apply(
        lambda x: get_name_from_soup(get_soup_from_wiki(f"https://wiki.warthunder.com/unit/{x}")))
    df["description"] = df["name"].apply(
        lambda x: get_desc_from_soup(get_soup_from_wiki(f"https://wiki.warthunder.com/unit/{x}")))
    return df


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
    data = data.replace(None, NA)
    return data.dropna(how="any")


def transform(raw: list[dict]) -> DataFrame:
    """Return cleaned and refined dataframe from raw data."""
    df = get_df_from_data(raw)
    print(raw[:10])
    df = get_refined_frame(df)
    print(df.head(10))
    df = run(get_name_and_description(df))
    df = clean_dataframe(df)
    print(df.head(10))
    return df


if __name__ == "__main__":
    with open("example_response.json", "r", encoding="utf-8") as f:
        data = loads(f.read())
    print(transform(data).head())