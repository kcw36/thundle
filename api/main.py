"""Module for serving the thundle API endpoints."""

from fastapi import FastAPI

app = FastAPI()


@app.get("/")
async def root():
    return {
        "message": "Hello World"
    }


@app.get("/random")
async def root(mode: str = "all"):
    return {
        "message": mode
    }


@app.get("/vehicles")
async def root(mode: str = "all", limit: int = 10):
    return {
        "message": {
            "mode": mode,
            "limit": limit
        }
    }