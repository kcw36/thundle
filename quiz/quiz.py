"""Script for serving a quiz."""

import streamlit as st

from data import get_data, get_random_record

def serve_quiz():
    """Serve the quiz frontend."""
    data = get_data(mode="ground")
    record = get_random_record(data)
    st.markdown(f"Random record:\n{record}")


if __name__ == "__main__":
    serve_quiz()