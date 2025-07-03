"""Module for serving the thundle API endpoints."""

from logging import getLogger, StreamHandler, INFO
from sys import stdout
from datetime import datetime

from fastapi import FastAPI, HTTPException
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
    release_date: datetime | None
    is_premium: bool
    is_pack: bool
    is_marketplace: bool
    is_squadron: bool
    image_url: HttpUrl
    mode: str = ["ground", "air", "naval", "helicopter"]
    name: str
    description: str | None


app = FastAPI()
load_dotenv()

logger = getLogger()
logger.setLevel(INFO)
logger.addHandler(StreamHandler(stdout))


def validate_mode(mode: str) -> bool:
    """Return true if mode is an accepted value."""
    if isinstance(mode, str):
        return mode in ["all", "ground", "air", "naval", "helicopter"]
    return False


def validate_limit(limit: int) -> bool:
    """Return true if limit is an accepted value."""
    if isinstance(limit, int):
        return limit > 0
    return False


@app.get("/")
async def root():
    return {
        "message": "Welcome to the Thundle Internal API",
        "version": "0.1.1",
        "endpoints": {
            "/vehicles": {
                "description": "Get a list of vehicle entries based on mode and limit.",
                "params": {
                    "mode": "all | ground | air | naval | helicopter (default: all)",
                    "limit": "Positive integer (default: 10)"
                },
                "returns": "List of vehicle objects"
            },
            "/random": {
                "description": "Get a single vehicle based on today's date (pseudo-random).",
                "params": {
                    "mode": "all | ground | air | naval | helicopter (default: all)"
                },
                "returns": "A single vehicle object"
            }
        },
        "docs": "/docs",
        "openapi_schema": "/openapi.json"
    }


@app.get("/random", response_model=Vehicle)
async def root(mode: str = "all"):
    if not validate_mode(mode):
        raise HTTPException(status_code=400, detail="Mode value not accepted.")
    document = get_doc_from_cache(mode)
    if document:
        return document
    data = get_objects(mode)
    hash_i = get_date_hash_index(len(data))
    cache_document(data[hash_i], mode)
    return data[hash_i]


@app.get("/vehicles", response_model=list[Vehicle])
async def root(mode: str = "all", limit: int = 10):
    if not validate_mode(mode):
        raise HTTPException(status_code=400, detail="Mode value not accepted.")
    if not validate_limit(limit):
        raise HTTPException(status_code=400, detail="Limit value not accepted.")
    documents = get_objects(mode, limit)
    return documents
