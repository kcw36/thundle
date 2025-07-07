"""Module for serving the thundle API endpoints."""

from logging import getLogger, StreamHandler, INFO
from sys import stdout
from datetime import datetime
from typing import Literal
from bson import ObjectId
from re import fullmatch

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel, HttpUrl, Field

from data import (get_date_hash_index, get_objects,
                  cache_document, get_doc_from_cache,
                  get_archive)


class Vehicle(BaseModel):
    _id: str = Field(alias='_id')
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
    mode: Literal["ground", "air", "naval", "helicopter"]
    name: str
    description: str | None

    class Config:
        allow_population_by_field_name = True
        populate_by_name = True
        json_encoders = {ObjectId: str}
        orm_mode = True


class CacheVehicle(BaseModel):
    _id: str = Field(alias='_id')
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
    mode: Literal["ground", "air", "naval", "helicopter"]
    name: str
    description: str | None
    game_mode: str
    data_set: str
    date: str

class VehicleOption(BaseModel):
    id: str = Field(alias="_id")
    name: str

    class Config:
        allow_population_by_field_name = True
        populate_by_name = True
        json_encoders = {ObjectId: str}
        orm_mode = True


app = FastAPI()

origins = [
    "http://localhost:5173",
    "https://thundle.onrender.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"]
)

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


def validate_game(game: str) -> bool:
    """Return true if game is an accepted value."""
    if isinstance(game, str):
        return game in ["blur", "clue"]
    return False


def validate_date(date: str) -> bool:
    """Return true if date is an accepted value."""
    if isinstance(date, str):
        return bool(fullmatch(r"\d{1,2}_\d{1,2}_\d{4}", date))
    return False


def get_offset_from_game(game: str) -> int:
    """Return offset integer from game string."""
    game_offset_map = {
        "blur" : 0,
        "clue" : 1
    }
    return game_offset_map[game]


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
async def root(mode: str = "all", game: str = "blur"):
    if not validate_mode(mode):
        raise HTTPException(status_code=400, detail="Mode value not accepted.")
    document = get_doc_from_cache(mode, game)
    if document:
        return document
    data = get_objects(mode)
    hash_i = get_date_hash_index(len(data), get_offset_from_game(game))
    cache_document(data[hash_i], mode, game)
    logger.info("Random vehicle is: %s", Vehicle(**data[hash_i]))
    data[hash_i]["_id"] = str(data[hash_i]["_id"])
    return Vehicle(**data[hash_i])


@app.get("/vehicles", response_model=list[Vehicle])
async def root(mode: str = "all", limit: int = 10):
    if not validate_mode(mode):
        raise HTTPException(status_code=400, detail="Mode value not accepted.")
    if not validate_limit(limit):
        raise HTTPException(status_code=400, detail="Limit value not accepted.")
    documents = get_objects(mode, limit)
    for v in documents:
        v["_id"] = str(v["_id"])
    return [Vehicle(**doc) for doc in documents]


@app.get("/names", response_model=list[VehicleOption])
async def root(mode: str = "all"):
    if not validate_mode(mode):
        raise HTTPException(status_code=400, detail="Mode value not accepted.")
    documents = get_objects(mode)
    for v in documents:
        v["_id"] = str(v["_id"])
    return [VehicleOption(**doc) for doc in documents]


@app.get("/historic", response_model=list[CacheVehicle] | None)
async def root(date: str = "07_07_2025", game: str = "blur"):
    if not validate_game(game):
        raise HTTPException(status_code=400, detail="Game value not accepted.")
    if not validate_date(date):
        raise HTTPException(status_code=400, detail="Date value not accepted must be in format, DD_MM_YYYY")
    documents = get_archive(date, game)
    if documents:
        return [CacheVehicle(**doc) for doc in documents]
    return None
