"""Module for serving the thundle API endpoints."""

from logging import getLogger, StreamHandler, INFO
from sys import stdout

from fastapi import FastAPI
from dotenv import load_dotenv
from pydantic import BaseModel, HttpUrl

from data import (get_date_hash_index, get_objects,
                  cache_document, get_doc_from_cache)


class Vehicle(BaseModel):
    _id: str
    country: str
    vehicle_type: str
    tier: int
    realistic_br: float
    realistic_ground_br: float
    is_event: bool
    release_date: str
    is_premium: bool
    is_pack: bool
    is_marketplace: bool
    is_squadron: bool
    image_url: HttpUrl
    mode: str
    name: str
    description: str


app = FastAPI()
load_dotenv()

logger = getLogger()
logger.setLevel(INFO)
logger.addHandler(StreamHandler(stdout))


@app.get("/")
async def root():
    return {
        "message": "Hello World"
    }


@app.get("/random", response_model=Vehicle)
async def root(mode: str = "all"):
    document = get_doc_from_cache()
    if document:
        return document
    data = get_objects(mode)
    hash_i = get_date_hash_index(len(data))
    cache_document(data[hash_i])
    return data[hash_i]


@app.get("/vehicles")
async def root(mode: str = "all", limit: int = 10):
    return {
        "message": {
            "mode": mode,
            "limit": limit
        }
    }