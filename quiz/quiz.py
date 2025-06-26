"""Script for serving a quiz."""

import streamlit as st

from data import get_data, get_random_record
from elements import (display_image,
                      get_image,
                      display_bool_buttons,
                      display_guess_input,
                      provide_autofill,
                      display_complex_buttons)

def serve_quiz():
    """Serve the quiz frontend."""
    data = get_data(mode="ground")
    record = get_random_record(data)

    if "score" not in st.session_state:
        st.session_state["score"] = 100
    if "guess" not in st.session_state:
        st.session_state["guess"] = ""

    col_1, col_2 = st.columns([0.9, 0.1])
    with col_1:
        query = display_guess_input()
        provide_autofill(query, data["name"].unique())
    with col_2:
        submit = st.button(label="→")
        st.text(f"Points\n{str(st.session_state["score"])}")

    if submit:
        if query.lower() == record["name"].lower():
            st.success("Correct.")
        else:
            st.warning("Incorrect.")
        st.text(record["name"])
        st.image(get_image("https://res.cloudinary.com/dq3acbzdm/image/upload/v1750956913/wnqdqfhyehikpl8lq2n6.png"))
    else:
        col_1, col_2 = st.columns([0.66, 0.33])
        with col_1:
            display_image(record["image_url"])
        with col_2:
            display_complex_buttons(record)
        display_bool_buttons(record)


if __name__ == "__main__":
    serve_quiz()