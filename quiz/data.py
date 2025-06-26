"""Module for serving quiz data."""

from datetime import date, timedelta
from hashlib import sha256

from pandas import DataFrame, read_parquet
from streamlit import cache_data


@cache_data(ttl=timedelta(days=1))
def get_data(mode: str) -> DataFrame:
    """Return all data from the parquet storage for given mode."""
    file_path = f"pipeline/local/mode={mode}"
    mode_df = read_parquet(file_path)
    return mode_df


@cache_data(ttl=timedelta(days=1))
def get_random_record(data: DataFrame) -> dict:
    """Return random record determined by date from dataframe."""
    now = date.today().isoformat()
    hash_now = int(sha256(now.encode()).hexdigest(), 16)
    index = hash_now % len(data)
    return data.iloc[index].to_dict()
