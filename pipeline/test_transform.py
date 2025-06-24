#pylint: skip-file
"""Tests for transform module."""

from pytest import mark
from pandas import DataFrame

from transform import (
    get_df_from_data,
    get_refined_frame,
    clean_dataframe,
    get_clean_plane_name,
    transform
)

class TestGetDfFromData:
    """Group of tests for get df from data method."""
    @mark.parametrize("input_name, expected", [
        ("a-20g", "A-20G"),
        ("a-26c-45-dt", "A-26C-45-DT"),
        ("a_109_eoa2", "A-109-EOA2"),
        ("a6m2_zero_usa", "A6M2 Zero [USA]"),
        ("a6m5_zero_china", "A6M5 Zero [CHINA]"),
        ("a_4e_early_iaf", "A-4E Early iaf"),
        ("a_29_hudson_ussr", "A-29 Hudson [USSR]"),
        ("a6m2_zero", "A6M2 Zero"),
        ("A-10a_Late_USA", "A-10A Late [USA]"),
        ("a6m2_zero_", "A6M2 Zero "),
    ])
    def test_get_clean_plane_name(input_name, expected):
        assert get_clean_plane_name(input_name) == expected


class TestGetDfFromData:
    """Group of tests for get df from data method."""
    def test_get_df_from_data(raw_data):
        df = get_df_from_data(raw_data)
        assert isinstance(df, DataFrame)
        assert len(df) == 2
        assert "extra_field" in df.columns


class TestGetDfFromData:
    """Group of tests for get refined frame method."""
    def test_get_refined_frame(raw_data, required_columns):
        df = get_df_from_data(raw_data)
        refined = get_refined_frame(df)
        assert list(refined.columns) == required_columns
        assert refined.shape[1] == len(required_columns)


class TestGetDfFromData:
    """Group of tests for get clean dataframe method."""
    def test_clean_dataframe(raw_data):
        df = get_df_from_data(raw_data)
        refined = get_refined_frame(df)
        cleaned = clean_dataframe(refined)
        assert len(cleaned) == 1
        assert cleaned["name"].iloc[0] == "Tank A"


class TestGetDfFromData:
    """Group of tests for transform method."""
    def test_transform(raw_data, required_columns):
        result = transform(raw_data)
        assert isinstance(result, DataFrame)
        assert list(result.columns) == required_columns
        assert len(result) == 1
