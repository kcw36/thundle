#pylint: skip-file
"""Tests for load module."""

from boto3 import client

import load as ld


class TestMakeParquet:
    """Group of tests for make parquet method."""
    def test_creates_partition_dirs_and_returns_modes(self,
                                                      sample_df,
                                                      tmp_path):
        """Test that make parquet creates expected files."""
        # Act
        modes = ld.make_parquet(tmp_path, sample_df)

        # Assert
        expected_dirs = {tmp_path / f"mode={m}" for m in modes}
        for d in expected_dirs:
            assert d.exists() and d.is_dir()
            assert any(p.suffix == ".parquet" for p in d.iterdir())

        assert set(modes) == {"air", "land"}


class TestUploadFiles:
    """Group of tests for upload files method."""
    def test_uploads_all_files_from_partition_dir(self,
                                                  moto_s3,
                                                  tmp_path):
        """Test that upload files loads expected files."""
        # Arrange
        part_dir = tmp_path / "mode=air"
        part_dir.mkdir(parents=True)
        sample_file = part_dir / "part-0000.parquet"
        sample_file.write_bytes(b"dummy parquet data")

        # Act
        ld.upload_files(moto_s3, tmp_path, "air")

        objects = moto_s3.list_objects_v2(Bucket=ld.ENV["AWS_BUCKET"])
        keys = [o["Key"] for o in objects.get("Contents", [])]

        # Assert
        assert f"input/mode=air/{sample_file.name}" in keys


class TestDeleteTemporaryFiles:
    """Group of tests for remove temporary files method."""
    def test_removes_partition_directory(self, tmp_path):
        """Test that delete temporary files removes files."""
        # Arrange
        d = tmp_path / "mode=land"
        d.mkdir(parents=True)
        (d / "dummy.txt").write_text("data")

        # Act
        ld.delete_temporary_files(tmp_path, "land")
        
        # Assert
        assert not d.exists()


class TestLoadIntegration:
    """Group of tests for load integration method."""
    def test_full_flow_creates_and_uploads_then_cleans(self, 
                                                       sample_df, 
                                                       moto_s3, 
                                                       tmp_path,
                                                       monkeypatch):
        """Test that load method correctly uploads and deletes files."""
        # Arrange
        monkeypatch.setattr(ld, "client", client)

        # Act
        ld.load(tmp_path, sample_df)
        objs = moto_s3.list_objects_v2(Bucket=ld.ENV["AWS_BUCKET"])
        uploaded = sorted(o["Key"] for o in objs.get("Contents", []))

        # Assert
        assert not (tmp_path / "mode=air").exists()
        assert not (tmp_path / "mode=land").exists()
        assert uploaded
        assert any("input/mode=air" in k for k in uploaded)
        assert any("input/mode=land" in k for k in uploaded)