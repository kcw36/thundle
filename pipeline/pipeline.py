"""Pipeline script from API to parquet files."""

from argparse import ArgumentParser
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


def get_mode() -> str:
    """Return local or cloud mode."""
    parser = ArgumentParser(
        prog="Pipeline Script",
        description="ETL pipeline for war thunder API"
    )
    parser.add_argument('--mode', '-m', choices=['local', 'cloud'], required=True)
    nspace = parser.parse_args()
    return nspace.mode


def run():
    """Run the pipeline."""
    set_logger()
    mode = get_mode()
    if mode is None:
        raise ValueError("Mode can only be local or cloud.")
    raw_data = extract(0, 1)
    cleaned_df = transform(raw_data)
    path_to_dir = None
    if mode == 'local':
        path_to_dir = 'local'
    elif mode =='cloud':
        path_to_dir = '/tmp'
    load(path_to_dir, cleaned_df)


if __name__ == "__main__":
    load_dotenv()
    run()
