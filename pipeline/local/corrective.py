"""Module for a url corrective script."""

import pandas as pd

def fix_image_urls(parquet_path: str) -> pd.DataFrame:
    """Read a Parquet file and fix image URLs by inserting '/images/'."""
    df = pd.read_parquet(f"./{parquet_path}")
    if "image_url" in df.columns:
        df["image_url"] = df["image_url"].str.replace(
            "https://static.encyclopedia.warthunder.com/",
            "https://static.encyclopedia.warthunder.com/images/",
            regex=False
        )
        df["image_url"] = df["image_url"] + ".png"
    with open(f"./{parquet_path}", "wb+") as f:
        df.to_parquet(f)


if __name__ == "__main__":
    text = input("Please input path: ")
    fix_image_urls(text)