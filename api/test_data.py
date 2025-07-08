"""Module for testing the data module."""

from unittest.mock import patch, MagicMock

from freezegun import freeze_time
from bson import ObjectId

from data import (get_collection, get_date_hash_index, get_objects,
                  cache_document, get_doc_from_cache, get_archive)


@patch("data.MongoClient")
def test_get_collection(mock_mongo_client):
    """Test that the get_collection function returns a collection."""
    mock_db = MagicMock()
    mock_mongo_client.return_value = {"test_db": mock_db}
    with patch.dict("data.ENV", {"DB_NAME": "test_db", "DB_CONN_STRING": "test_str"}):
        get_collection("test_collection")
        mock_db.__getitem__.assert_called_once_with("test_collection")


@freeze_time("2025-07-08")
def test_get_date_hash_index():
    """Test that the get_date_hash_index function returns a valid index."""
    index = get_date_hash_index(100, 0)
    assert isinstance(index, int)
    assert 0 <= index < 100


@patch("data.get_collection")
def test_get_objects(mock_get_collection):
    """Test that the get_objects function returns a list of objects."""
    mock_collection = MagicMock()
    mock_collection.find.return_value.limit.return_value = [{"name": "test"}]
    mock_get_collection.return_value = mock_collection

    objects = get_objects("all", 1)
    assert isinstance(objects, list)
    assert objects[0]["name"] == "test"
    mock_collection.find.assert_called_once_with({})
    mock_collection.find.return_value.limit.assert_called_once_with(1)


@patch("data.get_collection")
def test_cache_document(mock_get_collection):
    """Test that the cache_document function inserts a document."""
    mock_collection = MagicMock()
    mock_get_collection.return_value = mock_collection
    test_doc = {"_id": ObjectId(), "name": "test"}

    with freeze_time("2025-07-08"):
        cache_document(test_doc, "all", "blur")
    
    expected_doc = {
        "name": "test",
        "date": "08/07/2025",
        "data_set": "all",
        "game_mode": "blur"
    }
    mock_collection.insert_one.assert_called_once_with(expected_doc)


@patch("data.get_collection")
def test_get_doc_from_cache(mock_get_collection):
    """Test that the get_doc_from_cache function returns a document."""
    mock_collection = MagicMock()
    mock_collection.find.return_value = [{"name": "test"}]
    mock_get_collection.return_value = mock_collection

    with freeze_time("2025-07-08"):
        doc = get_doc_from_cache("all", "blur")

    assert isinstance(doc, dict)
    assert doc["name"] == "test"
    expected_query = {
        "date": "08/07/2025",
        "data_set": "all",
        "game_mode": "blur"
    }
    mock_collection.find.assert_called_once_with(expected_query)


@patch("data.get_collection")
def test_get_archive_with_date(mock_get_collection):
    """Test that the get_archive function returns a list of documents for a specific date."""
    mock_collection = MagicMock()
    mock_collection.find.return_value = [{"name": "test"}]
    mock_get_collection.return_value = mock_collection

    docs = get_archive("08_07_2025", "blur", "all")

    assert isinstance(docs, list)
    assert docs[0]["name"] == "test"
    expected_query = {
        "game_mode": "blur",
        "data_set": "all",
        "date": "08/07/2025"
    }
    mock_collection.find.assert_called_once_with(expected_query)


@patch("data.get_collection")
def test_get_archive_no_date(mock_get_collection):
    """Test that the get_archive function returns a list of documents without a specific date."""
    mock_collection = MagicMock()
    mock_collection.find.return_value = [{"name": "test"}]
    mock_get_collection.return_value = mock_collection

    docs = get_archive(None, "blur", "all")

    assert isinstance(docs, list)
    assert docs[0]["name"] == "test"
    expected_query = {
        "game_mode": "blur",
        "data_set": "all"
    }
    mock_collection.find.assert_called_once_with(expected_query)
