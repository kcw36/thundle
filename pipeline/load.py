"""Module for loading data to cloud storage."""

from os import walk, environ as ENV
from shutil import rmtree
from logging import getLogger

from pandas import DataFrame, read_csv
from boto3 import client
from dotenv import load_dotenv


def get_client() -> client:
    """Return S3 client."""
    return client('s3')


def make_parquet(dir_path: str, input_data: DataFrame) -> list[str]:
    """Return list of directories containing parquet files from given DataFrame."""
    logger = getLogger()
    logger.info("Uploading data as parquet to %s directory.", dir_path)
    input_data.to_parquet(path=dir_path, engine="pyarrow", partition_cols=["mode"])
    return input_data["mode"].unique().tolist()


def upload_files(boto_client: client, dir_path: str, mode: str):
    """Walks a directory and uploads all files inside it to S3."""
    logger = getLogger()
    logger.info("Uploading files to S3 for path: %s.", f"{dir_path}/mode={mode}")
    for root, _, files in walk(f"{dir_path}/mode={mode}"):
        for file in files:
            if file:
                boto_client.upload_file(f"{root}/{file}",
                                        ENV["AWS_BUCKET"],
                                        f"input/mode={mode}/{file}")


def delete_temporary_files(dir_path: str, mode: str):
    """Removes files from given directory."""
    logger = getLogger()
    logger.info("Deleting files for path: %s.", mode)
    rmtree(f"{dir_path}/mode={mode}")


def load(dir_path: str, data: DataFrame):
    """Upload data to S3 or locally as partitioned parquet files."""
    logger = getLogger()
    logger.info("Uploading data now...")
    if dir_path == "local":
        dirs = make_parquet(dir_path, data)
    else:
        dirs = make_parquet(dir_path, data)
        s3 = get_client()
        for d in dirs:
            upload_files(s3, dir_path, d)
            delete_temporary_files(dir_path, d)


if __name__ == "__main__":
    load_dotenv()
    load("local", read_csv("example_df.csv"))
