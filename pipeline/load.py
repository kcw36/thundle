"""Module for loading data to cloud storage."""

from os import walk, environ as ENV
from shutil import rmtree

from pandas import DataFrame
from boto3 import client
from dotenv import load_dotenv


def get_client() -> client:
    """Return S3 client."""
    return client('s3')


def make_parquet(input_data: DataFrame) -> list[str]:
    """Return list of directories containing parquet files from given DataFrame."""
    input_data.to_parquet(path="/tmp/", engine="pyarrow", partition_cols=["mode"])
    return input_data["mode"].unique().tolist()


def upload_files(boto_client: client, dir_path: str):
    """Walks a directory and uploads all files inside it to S3."""
    root, _, files = walk(f"/tmp/{dir_path}")
    for path in root:
        for file in files:
            if file:
                boto_client.upload_file(f"{path}/{file}",
                                        ENV["AWS_BUCKET"],
                                        f"input/{dir_path}/{file}")


def delete_temporary_files(boto_client: client, dir_path: str):
    """Removes files from given directory."""
    rmtree(f"/tmp/{dir_path}")


def load(data: DataFrame):
    """Upload data to S3 as partitioned parquet files."""
    dirs = make_parquet(data)
    
    s3 = get_client()
    
    for d in dirs:
        upload_files(s3, d)
        delete_temporary_files(s3, d) 


if __name__ == "__main__":
    load_dotenv()
    load()
