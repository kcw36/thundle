"""Module for handling requests to MongoDB for API."""

from os import environ as ENV
from hashlib import sha256
from datetime import date, timedelta
from logging import getLogger
from uuid import uuid4

from dotenv import load_dotenv
from pymongo.mongo_client import MongoClient
from pymongo.collection import Collection
from pymongo.server_api import ServerApi


def get_collection(name: str = "vehicles") -> Collection:
    """Return collection for MongoDB."""
    logger = getLogger()
    logger.info("Getting MongoDB connection...")
    mongo = MongoClient(ENV["DB_CONN_STRING"], server_api=ServerApi('1'))
    db = mongo[ENV["DB_NAME"]]
    return db[name]


def get_date_hash_index(n: int, offset: int) -> int:
    """Return index for an iterable of length n selected by date hash."""
    logger = getLogger()
    logger.info("Finding date based list index for list of size %s...", n)
    date_offset = date.today() + timedelta(weeks=offset*52)
    time_to_encode = date_offset.isoformat()
    hash_now = int(sha256(time_to_encode.encode()).hexdigest(), 16)
    return hash_now % n


def get_objects(mode: str, limit: int = None) -> list[dict]:
    """Return list of objects for given game mode within limit, if present."""
    logger = getLogger()
    logger.info("Getting objects from MongoDB for game mode: %s...", mode)
    collection = get_collection("vehicles")

    if mode == "all":
        query = {}
    else:
        query = { "mode": mode }

    if limit:
        documents = list(collection.find(query).limit(limit))
    else:
        documents = list(collection.find(query))

    logger.info("Found documents, listing first result:\n %s", documents[0])
    return documents


def cache_document(doc: dict, mode: str = "all", game: str = "blur"):
    """Upload random selection for today's date to MongoDB."""
    logger = getLogger()
    logger.info("Caching document...")
    collection = get_collection("cache")
    doc["date"] = date.today().strftime(r"%d/%m/%Y")
    doc["data_set"] = mode
    doc["game_mode"] = game
    del doc["_id"]
    collection.insert_one(doc)


def get_doc_from_cache(mode: str = "all", game: str = "blur") -> dict:
    """Return cached object for today's date if it is present."""
    logger = getLogger()
    logger.info("Checking cache for document...")
    collection = get_collection("cache")
    query = { 
        "date": date.today().strftime(r"%d/%m/%Y"),
        "data_set": mode,
        "game_mode": game
    }
    document = list(collection.find(query))
    if document:
        logger.info("Found document in cache: %s", document[0])
        return document[0]
    return None


if __name__ == "__main__":
    load_dotenv()
    data = get_objects("all")
    random_i = get_date_hash_index(len(data))
    print(data[random_i])
