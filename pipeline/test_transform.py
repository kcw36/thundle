# pylint: skip-file
"""Tests for transform module."""

from pandas import DataFrame

from transform import (
    get_df_from_data,
    get_refined_frame,
    clean_dataframe,
    transform
)

class TestGetDfFromData:
    def test_get_df_from_data(self, raw_data):
        df = get_df_from_data(raw_data)
        assert isinstance(df, DataFrame)
        assert len(df) == 2
        assert "extra_field" in df.columns


class TestGetRefinedFrame:
    def test_get_refined_frame(self, raw_data, required_columns):
        df = get_df_from_data(raw_data)
        refined = get_refined_frame(df)
        assert isinstance(refined, DataFrame)
        assert list(refined.columns) == required_columns
        assert refined.shape[1] == len(required_columns)


class TestCleanDataFrame:
    def test_clean_dataframe(self, raw_data):
        df = get_df_from_data(raw_data)
        refined = get_refined_frame(df)
        cleaned = clean_dataframe(refined)
        assert isinstance(cleaned, DataFrame)
        assert all(cleaned.notna().all())


class TestTransform:
    def test_transform(self, raw_data, required_columns):
        result = transform(raw_data)
        assert isinstance(result, DataFrame)
        assert list(result.columns) == required_columns + ["name", "description"]
        assert all(result.notna().all())

