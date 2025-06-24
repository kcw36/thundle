#pylint: skip-file
"""Fixtures for pipeline tests."""

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
