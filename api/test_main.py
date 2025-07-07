"""Module for testing the main module."""

from unittest.mock import patch
from fastapi.testclient import TestClient
from bson import ObjectId
from main import app

client = TestClient(app)

def get_mock_vehicle():
    """Return a mock vehicle."""
    return {
        "_id": ObjectId("60c72b9f9b1d8e001f8e4c6d"),
        "country": "USA",
        "vehicle_type": "Plane",
        "tier": 4,
        "realistic_br": 5.0,
        "realistic_ground_br": 0.0,
        "is_event": False,
        "release_date": None,
        "is_premium": True,
        "is_pack": False,
        "is_marketplace": False,
        "is_squadron": False,
        "image_url": "http://example.com/image.png",
        "mode": "air",
        "name": "Test Plane",
        "description": "A test plane."
    }


def test_root():
    """Test the root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["message"] == "Welcome to the Thundle Internal API"


@patch("main.get_doc_from_cache")
@patch("main.get_objects")
@patch("main.get_date_hash_index")
@patch("main.cache_document")
def test_random_no_cache(mock_cache_document, mock_get_date_hash_index, mock_get_objects, mock_get_doc_from_cache):
    """Test the random endpoint when no document is cached."""
    mock_get_doc_from_cache.return_value = None
    mock_get_objects.return_value = [get_mock_vehicle()]
    mock_get_date_hash_index.return_value = 0

    response = client.get("/random")
    assert response.status_code == 200
    json_response = response.json()
    assert json_response["name"] == "Test Plane"
    mock_cache_document.assert_called_once()


@patch("main.get_doc_from_cache")
def test_random_with_cache(mock_get_doc_from_cache):
    """Test the random endpoint when a document is cached."""
    mock_get_doc_from_cache.return_value = get_mock_vehicle()
    response = client.get("/random")
    assert response.status_code == 200
    json_response = response.json()
    assert json_response["name"] == "Test Plane"


def test_random_invalid_mode():
    """Test the random endpoint with an invalid mode."""
    response = client.get("/random?mode=invalid")
    assert response.status_code == 400
    assert response.json()["detail"] == "Mode value not accepted."


@patch("main.get_objects")
def test_vehicles(mock_get_objects):
    """Test the vehicles endpoint."""
    mock_get_objects.return_value = [get_mock_vehicle()]
    response = client.get("/vehicles")
    assert response.status_code == 200
    json_response = response.json()
    assert isinstance(json_response, list)
    assert json_response[0]["name"] == "Test Plane"


def test_vehicles_invalid_mode():
    """Test the vehicles endpoint with an invalid mode."""
    response = client.get("/vehicles?mode=invalid")
    assert response.status_code == 400
    assert response.json()["detail"] == "Mode value not accepted."


def test_vehicles_invalid_limit():
    """Test the vehicles endpoint with an invalid limit."""
    response = client.get("/vehicles?limit=0")
    assert response.status_code == 400
    assert response.json()["detail"] == "Limit value not accepted."


@patch("main.get_objects")
def test_names(mock_get_objects):
    """Test the names endpoint."""
    mock_get_objects.return_value = [get_mock_vehicle()]
    response = client.get("/names")
    assert response.status_code == 200
    json_response = response.json()
    assert isinstance(json_response, list)
    assert json_response[0]["name"] == "Test Plane"
    assert "id" in json_response[0]


def test_names_invalid_mode():
    """Test the names endpoint with an invalid mode."""
    response = client.get("/names?mode=invalid")
    assert response.status_code == 400
    assert response.json()["detail"] == "Mode value not accepted."


@patch("main.get_archive")
def test_historic(mock_get_archive):
    """Test the historic endpoint."""
    mock_vehicle = get_mock_vehicle()
    mock_vehicle["game_mode"] = "blur"
    mock_vehicle["data_set"] = "all"
    mock_vehicle["date"] = "08/07/2025"
    mock_get_archive.return_value = [mock_vehicle]
    response = client.get("/historic?date=08_07_2025")
    assert response.status_code == 200
    json_response = response.json()
    assert isinstance(json_response, list)
    assert json_response[0]["name"] == "Test Plane"


def test_historic_invalid_game():
    """Test the historic endpoint with an invalid game."""
    response = client.get("/historic?game=invalid")
    assert response.status_code == 400
    assert response.json()["detail"] == "Game value not accepted."


def test_historic_invalid_date():
    """Test the historic endpoint with an invalid date."""
    response = client.get("/historic?date=invalid")
    assert response.status_code == 400
    assert response.json()["detail"] == "Date value not accepted, must be in format, DD_MM_YYYY"


def test_historic_invalid_mode():
    """Test the historic endpoint with an invalid mode."""
    response = client.get("/historic?mode=invalid")
    assert response.status_code == 400
    assert response.json()["detail"] == "Mode value not accepted."


@patch("main.get_archive")
def test_cached_dates(mock_get_archive):
    """Test the cached_dates endpoint."""
    mock_vehicle = get_mock_vehicle()
    mock_vehicle["date"] = "08/07/2025"
    mock_get_archive.return_value = [mock_vehicle]
    response = client.get("/cached_dates")
    assert response.status_code == 200
    json_response = response.json()
    assert isinstance(json_response, list)
    assert json_response[0] == "08_07_2025"


def test_cached_dates_invalid_game():
    """Test the cached_dates endpoint with an invalid game."""
    response = client.get("/cached_dates?game=invalid")
    assert response.status_code == 400
    assert response.json()["detail"] == "Game value not accepted."
