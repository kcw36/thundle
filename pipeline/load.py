"""Module for loading data to cloud storage."""

from os import environ as ENV
from logging import getLogger, INFO, StreamHandler
from sys import stdout

from pandas import DataFrame, read_csv
from dotenv import load_dotenv
from pymongo.mongo_client import MongoClient
from pymongo.collection import Collection
from pymongo.server_api import ServerApi


def get_client() -> MongoClient:
    """Return Mongo client."""
    logger = getLogger()
    logger.info("Getting client connection to MongoDB...")
    return MongoClient(ENV["DB_CONN_STRING"], server_api=ServerApi('1'))


def upload_files(mongo: MongoClient, documents: list[dict]):
    """Upload all documents for MongoDB."""
    logger = getLogger()
    logger.info("Uploading documents to MongoDB: %s.", mongo.address)
    db = mongo[ENV["DB_NAME"]]
    collection = db[ENV["DB_COLLECTION"]]
    for doc in documents:
        insert_document(collection, doc)


def insert_document(col: Collection, doc: dict):
    """Insert document if id does not already exist."""
    logger = getLogger()
    if col.find_one({"_id": doc["_id"]}) is None:
        logger.info("Uploading document to MongoDB: %s.", doc['_id'])
        col.insert_one(doc)
        return True
    logger.info("Document with _id %s already exists.", doc['_id'])
    return False


def get_json(df: DataFrame) -> list[dict]:
    """Return list of json objects."""
    logger = getLogger()
    logger.info("Converting dataframe to list of dictionaries...")
    return df.to_dict(orient="records")
    

def load(data: DataFrame):
    """Upload data to MongoDB."""
    logger = getLogger()
    logger.info("Starting load phase...")
    mongo = get_client()
    json = get_json(data)
    upload_files(mongo, json)


if __name__ == "__main__":
    load_dotenv()
    logger = getLogger()
    logger.setLevel(INFO)
    logger.addHandler(StreamHandler(stdout))
    data = read_csv("example_df.csv")
    load(data)
