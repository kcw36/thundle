"""Module for loading data to cloud storage."""

from os import walk, environ as ENV
from sys import stdout
from shutil import rmtree
from logging import getLogger, INFO, StreamHandler

from pandas import DataFrame, read_csv
from boto3 import client
from dotenv import load_dotenv


def get_client() -> client:
    """Return S3 client."""
    return client('s3')


def make_parquet(input_data: DataFrame) -> list[str]:
    """Return list of directories containing parquet files from given DataFrame."""
    logger = getLogger()
    logger.info("Uploading data as parquet to tmp directory.")
    input_data.to_parquet(path="/tmp/", engine="pyarrow", partition_cols=["mode"])
    return input_data["mode"].unique().tolist()


def upload_files(boto_client: client, mode: str):
    """Walks a directory and uploads all files inside it to S3."""
    logger = getLogger()
    logger.info("Uploading files to S3 for path: %s.", f"/tmp/mode={mode}")
    for root, _, files in walk(f"/tmp/mode={mode}"):
        for file in files:
            if file:
                boto_client.upload_file(f"{root}/{file}",
                                        ENV["AWS_BUCKET"],
                                        f"input/mode={mode}/{file}")


def delete_temporary_files(dir_path: str):
    """Removes files from given directory."""
    logger = getLogger()
    logger.info("Deleting files for path: %s.", dir_path)
    rmtree(f"/tmp/mode={dir_path}")


def load(data: DataFrame):
    """Upload data to S3 as partitioned parquet files."""
    dirs = make_parquet(data)
    s3 = get_client()
    for d in dirs:
        upload_files(s3, d)
        delete_temporary_files(d)


if __name__ == "__main__":
    logger = getLogger()
    logger.setLevel(INFO)
    logger.addHandler(StreamHandler(stdout))
    load_dotenv()
    load(read_csv("example_df.csv"))
