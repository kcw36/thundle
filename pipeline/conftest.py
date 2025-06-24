#pylint: skip-file
"""Fixtures for pipeline tests."""

from pytest import fixture


@fixture
def raw_data():
    return [
        {
            "name": "Tank A",
            "country": "USA",
            "vehicle_type": "Tank",
            "vehicle_sub_types": ["Heavy"],
            "era": "WWII",
            "realistic_br": 6.7,
            "realistic_ground_br": 6.3,
            "event": False,
            "release_date": "2023-01-01",
            "is_premium": False,
            "is_pack": False,
            "on_marketplace": False,
            "squadron_vehicle": False,
            "image_url": "http://example.com/tank_a.jpg",
            "extra_field": "should be ignored"
        },
        {
            "name": None,
            "country": "Germany",
            "vehicle_type": "Tank",
            "vehicle_sub_types": ["Medium"],
            "era": "Cold War",
            "realistic_br": 7.3,
            "realistic_ground_br": 7.0,
            "event": False,
            "release_date": "2022-05-01",
            "is_premium": True,
            "is_pack": True,
            "on_marketplace": True,
            "squadron_vehicle": False,
            "image_url": None
        }
    ]


@fixture
def required_columns():
    return [
        "name", "country", "vehicle_type", "vehicle_sub_types", "era",
        "realistic_br", "realistic_ground_br", "event", "release_date",
        "is_premium", "is_pack", "on_marketplace", "squadron_vehicle", "image_url"
    ]