"""Module for transforming api response into refined DataFrame."""

from json import loads
from asyncio import run, gather, Semaphore
from datetime import datetime
from logging import getLogger

from bs4 import BeautifulSoup
from aiohttp import ClientSession
from pandas import DataFrame, to_datetime, NA

semaphore = Semaphore(5)

async def fetch(session: ClientSession, url: str) -> str:
    """Get async client connection."""
    logger = getLogger()
    logger.info("Fetching information from wiki: %s", url)
    async with semaphore:
        async with session.get(url, timeout=30) as resp:
            return await resp.text()


def parse_name(soup: BeautifulSoup) -> str:
    """Parse name from soup."""
    tag = soup.find("div", class_="game-unit_name")
    return tag.text.strip() if tag else None


def parse_desc(soup: BeautifulSoup) -> str:
    """Parse description from soup."""
    tag = soup.find("div", class_="content-markdown")
    return tag.text.strip() if tag else None


async def fetch_name_and_description(session, identifier):
    """Return name and description from wiki."""
    url = f"https://wiki.warthunder.com/unit/{identifier}"
    logger = getLogger()
    logger.info("Fetching url: %s", url)
    try:
        html = await fetch(session, url)
        soup = BeautifulSoup(html, "html.parser")
        return {
            "identifier": identifier,
            "name": parse_name(soup),
            "description": parse_desc(soup)
        }
    except Exception as e:
        print(f"Error fetching {url}: {e.with_traceback()}")
        return {
            "identifier": identifier,
            "name": None,
            "description": None
        }


async def get_name_and_description(df: DataFrame) -> DataFrame:
    """Return name and description added to dataframe."""
    identifiers = df["identifier"].tolist()
    async with ClientSession() as session:
        tasks = [fetch_name_and_description(session, ident) for ident in identifiers]
        results = await gather(*tasks)

    result_df = DataFrame(results)
    df = df.merge(result_df, on="identifier", how="left")
    return df


def get_df_from_data(raw: list[dict]) -> DataFrame:
    """Return dataframe from list of dictionaries."""
    return DataFrame(raw)


def get_image_url(urls: dict) -> str:
    """Return url from original url."""
    img = None
    if isinstance(urls, dict):
        img = urls.get("image")
        img = img.replace("https://www.wtvehiclesapi.sgambe.serv00.net/assets/",
                          "https://static.encyclopedia.warthunder.com/")
    return img


def get_refined_frame(data: DataFrame) -> DataFrame:
    """Return dataframe with only required data included."""
    cols_to_keep = [
        "identifier", "country", "vehicle_type", "era",
        "realistic_br", "realistic_ground_br", "event", "release_date",
        "is_premium", "is_pack", "on_marketplace", "squadron_vehicle", "images"
    ]
    refined = data[cols_to_keep].copy()

    refined["images"] = refined["images"].apply(get_image_url)
    refined["event"] = refined["event"].astype(bool)
    refined["release_date"] = to_datetime(refined["release_date"], utc=True)
    refined["release_date"] = refined["release_date"].replace(
        {None: datetime(year=2016, month=12, day=21)})

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
        "event": "is_event",
        "on_marketplace": "is_marketplace", 
        "squadron_vehicle": "is_squadron", 
        "images": "image_url", "era": "tier"
    }
    return refined.rename(columns=rename_cols)


def clean_dataframe(data: DataFrame) -> DataFrame:
    """Return cleaned dataframe without empty or invalid data points."""
    data = data.replace({None: NA})
    return data.dropna(how="any")


def transform(raw: list[dict]) -> DataFrame:
    """Return cleaned and refined dataframe from raw data."""
    df = get_df_from_data(raw)
    df = get_refined_frame(df)
    df = run(get_name_and_description(df))
    df = clean_dataframe(df)
    return df


async def transform_async(raw: list[dict]) -> DataFrame:
    """Return cleaned and refined dataframe from raw data as async for use in notebook."""
    df = get_df_from_data(raw)
    df = get_refined_frame(df)
    df = await get_name_and_description(df)
    df = clean_dataframe(df)
    return df


if __name__ == "__main__":
    with open("example_response.json", "r", encoding="utf-8") as f:
        raw_dict = loads(f.read())
    clean_df = transform(raw_dict)
    clean_df.to_csv("example_df.csv")
