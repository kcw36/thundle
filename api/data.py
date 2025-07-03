"""Module for handling requests to MongoDB for API."""

from os import environ as ENV
from hashlib import sha256
from datetime import date

from dotenv import load_dotenv
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi


def get_date_hash_index(n: int) -> int:
    """Return index for an iterable of length n selected by date hash."""
    now = date.today().isoformat()
    hash_now = int(sha256(now.encode()).hexdigest(), 16)
    return hash_now % n


def get_objects(mode: str) -> list[dict]:
    """Return list of objects for given game mode."""
    mongo = MongoClient(ENV["DB_CONN_STRING"], server_api=ServerApi('1'))
    db = mongo[ENV["DB_NAME"]]
    collection = db["vehicles"]
    if mode == "all":
        query = {}
    else:
        query = { "mode": mode }
    documents = collection.find(query)
    return list(documents)


if __name__ == "__main__":
    load_dotenv()
    data = get_objects("all")
    random_i = get_date_hash_index(len(data))
    print(data[random_i])
