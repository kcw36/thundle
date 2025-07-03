# pylint: skip-file
"""Unit tests for the load module (uploading to MongoDB)."""

from unittest.mock import MagicMock, patch

from load import get_json, upload_files, insert_document, load


# ---------------------------------------------------------------------------
# Tests for get_json
# ---------------------------------------------------------------------------
class TestGetJson:
    def test_returns_list_length(self, sample_df):
        docs = get_json(sample_df)
        assert isinstance(docs, list)
        assert len(docs) == len(sample_df)

    def test_contents_match(self, sample_df):
        expected = sample_df.to_dict(orient="records")
        assert get_json(sample_df) == expected


# ---------------------------------------------------------------------------
# Tests for insert_document
# ---------------------------------------------------------------------------
class TestInsertDocument:
    def test_inserts_when_not_exists(self):
        col = MagicMock()
        col.find_one.return_value = None  # simulate missing document
        doc = {"_id": "a-20g"}

        inserted = insert_document(col, doc)

        col.insert_one.assert_called_once_with(doc)
        assert inserted is True

    def test_skips_when_exists(self):
        col = MagicMock()
        col.find_one.return_value = {"_id": "a-20g"}  # already exists
        doc = {"_id": "a-20g"}

        inserted = insert_document(col, doc)

        col.insert_one.assert_not_called()
        assert inserted is False


# ---------------------------------------------------------------------------
# Tests for upload_files
# ---------------------------------------------------------------------------
class TestUploadFiles:
    def test_uploads_each_document(self, sample_docs):
        # Mock collection and mongo hierarchy
        collection = MagicMock()
        mongo = MagicMock()
        mongo.__getitem__.return_value = collection  # mongo[DB_NAME] -> collection
        mongo.address = ("example.com", 27017)

        # Patch insert_document to count calls
        with patch("load.insert_document", return_value=True) as mock_insert:
            upload_files(mongo, sample_docs)
            assert mock_insert.call_count == len(sample_docs)

    def test_handles_empty_input(self):
        collection = MagicMock()
        mongo = MagicMock()
        mongo.__getitem__.return_value = collection
        mongo.address = ("example.com", 27017)

        with patch("load.insert_document", return_value=True) as mock_insert:
            upload_files(mongo, [])
            mock_insert.assert_not_called()


# ---------------------------------------------------------------------------
# Tests for load (integration of helpers)
# ---------------------------------------------------------------------------
class TestLoad:
    """Collection of tests for load method."""

    def test_load_calls_helpers(self, sample_df):
        """Test that load calls correct methods."""
        mock_client = MagicMock()
        with patch("load.get_client", MagicMock(return_value=mock_client)) as mock_get_client,\
            patch("load.upload_files", MagicMock()) as mock_upload:
            load(sample_df)
            mock_get_client.assert_called_once()
        expected_docs = sample_df.to_dict(orient="records")
        assert mock_upload.call_args[0][0] == mock_client
        assert mock_upload.call_args[0][1] == expected_docs


    @patch("load.upload_files", MagicMock())
    def test_load_passes_dataframe_intact(self, sample_df):

        # Spy on get_json via patch.object
        with patch("load.get_json", wraps=get_json) as spy_get_json,\
            patch("load.get_client", MagicMock(return_value=MagicMock())):
            load(sample_df)
            spy_get_json.assert_called_once_with(sample_df)
