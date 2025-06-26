"""Script for serving a quiz."""

import streamlit as st

from data import get_data, get_random_record

def serve_quiz():
    """Serve the quiz frontend."""
    data = get_data(mode="ground")
    record = get_random_record(data)

    col_1, col_2 = st.columns([0.9, 0.1])
    with col_1:
        guess = st.text_input(label="guess",
                              placeholder="Guess...",
                              label_visibility="hidden")
    with col_2:
        submit = st.button(label="→")

    col_1, col_2, col_3 = st.columns(3)


if __name__ == "__main__":
    serve_quiz()