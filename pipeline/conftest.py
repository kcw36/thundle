#pylint: skip-file
"""Fixtures for pipeline tests."""

from pandas import DataFrame
from pytest import fixture


@fixture
def raw_data():
    return [
        {
            "identifier": "tank_a",
            "country": "USA",
            "vehicle_type": "light_tank",
            "era": 2,
            "realistic_br": 5.3,
            "realistic_ground_br": 5.7,
            "event": True,
            "release_date": "2017-01-01",
            "is_premium": True,
            "is_pack": False,
            "on_marketplace": False,
            "squadron_vehicle": False,
            "images": {"image": "http://example.com/tank_a.jpg"},
            "extra_field": "not_needed"
        },
        {
            "identifier": "tank_b",
            "country": "Germany",
            "vehicle_type": "heavy_tank",
            "era": 3,
            "realistic_br": 6.3,
            "realistic_ground_br": 6.7,
            "event": None,
            "release_date": None,
            "is_premium": False,
            "is_pack": True,
            "on_marketplace": True,
            "squadron_vehicle": True,
            "images": None,
            "extra_field": "not_needed"
        }
    ]


@fixture
def required_columns():
    return [
        "identifier", "country", "vehicle_type", "tier", "realistic_br", 
        "realistic_ground_br", "is_event", "release_date", "is_premium", 
        "is_pack", "is_marketplace", "is_squadron", "image_url", "mode"
    ]


@fixture(scope="module")
def sample_df():
    """Simple DataFrame with two partitions (mode=air|land)."""
    return DataFrame(
        {
            "id": [1, 2],
            "mode": ["air", "land"],
            "value": [10.5, 20.2],
        }
    )


@fixture(autouse=True)
def _set_env(monkeypatch):
    """Populate required env vars for the module."""
    monkeypatch.setenv("DB_CONN_STRING", "mongodb://example.com")
    monkeypatch.setenv("DB_NAME", "test_db")
    monkeypatch.setenv("DB_COLLECTION", "vehicles")
    

@fixture
def sample_df():
    return DataFrame(
        [
            {"_id": "a-20g", "country": "USA", "tier": 2},
            {"_id": "f-16c", "country": "USA", "tier": 7},
        ]
    )


@fixture
def sample_docs(sample_df):
    return sample_df.to_dict(orient="records")