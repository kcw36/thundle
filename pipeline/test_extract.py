# pylint: skip-file

"""Tests for extract module."""

from unittest import TestCase
from unittest.mock import patch, MagicMock

from extract import get_response_page, extract


class TestGetResponsePage(TestCase):
    """Tests for get response page method."""

    @patch("extract.get")
    def test_returns_api_data_for_page(self, mock_get):
        # Arrange
        expected_data = [{"name": "Tank A"}, {"name": "Tank B"}]
        mock_response = MagicMock()
        mock_response.json.return_value = expected_data
        mock_get.return_value = mock_response

        # Act
        result = get_response_page(2)

        # Assert
        mock_get.assert_called_once_with(
            "https://www.wtvehiclesapi.sgambe.serv00.net/api/vehicles",
            params={"limit": 200, "page": 2},
            timeout=10
        )
        self.assertEqual(result, expected_data)


class TestExtract(TestCase):
    """Tests for extract method."""

    @patch("extract.get_response_page")
    def test_combines_multiple_pages(self, mock_get_response_page):
        # Arrange
        mock_get_response_page.side_effect = [
            [{"name": "Tank 1"}],
            [{"name": "Tank 2"}, {"name": "Tank 3"}]
        ]

        # Act
        result = extract(n=0, m=1)

        # Assert
        self.assertEqual(result, [
            {"name": "Tank 1"},
            {"name": "Tank 2"},
            {"name": "Tank 3"}
        ])
        self.assertEqual(mock_get_response_page.call_count, 2)
        mock_get_response_page.assert_any_call(0)
        mock_get_response_page.assert_any_call(1)
