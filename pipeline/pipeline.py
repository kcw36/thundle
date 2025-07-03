"""Pipeline script from API to parquet files."""

from argparse import ArgumentParser, Namespace
from sys import stdout
from logging import (getLogger, Logger, INFO,
                     StreamHandler)

from dotenv import load_dotenv

from extract import extract
from transform import transform
from load import load

def set_logger() -> Logger:
    """Set root logger."""
    logger = getLogger()
    logger.setLevel(INFO)
    logger.addHandler(StreamHandler(stdout))


def get_args() -> Namespace:
    """Return local or cloud mode."""
    parser = ArgumentParser(
        prog="Pipeline Script",
        description="ETL pipeline for war thunder API"
    )
    parser.add_argument('--start', '-s', type=int, required=True)
    parser.add_argument('--end', '-e', type=int, required=True)
    return parser.parse_args()

def run():
    """Run the pipeline."""
    set_logger()
    args = get_args()
    start = args.start
    end = args.end
    if start is None:
        raise ValueError("Need a start value.")
    if end is None:
        raise ValueError("Need an end value.")
    if start < 0:
        raise ValueError("Start cannot be below 0.")
    raw_data = extract(start, end)
    cleaned_df = transform(raw_data)
    load(cleaned_df)


if __name__ == "__main__":
    load_dotenv()
    run()
