"""Module for serving zoom page."""

import streamlit as st

from data import get_data, get_random_record
from elements import (get_image, get_cropped_image, update_state,
                      provide_autofill, display_guess_input,
                      display_zoom_increment_submit)


def serve_page():
    """Serve the streamlit page."""
    image_key = "zoom_image"
    data = get_data("ground")
    record = get_random_record(data)
    image_url = record["image_url"]
    image = get_image(image_url)

    zoom_key = "zoom_factor"
    if st.session_state.get(zoom_key) is None:
        st.session_state[zoom_key] = 6
    if st.session_state.get(image_key) is None:
        st.session_state[image_key] = get_cropped_image(image, st.session_state[zoom_key])
    if st.session_state.get("zoom_guess") is None:
        st.session_state["zoom_guess"] = ""

    st.image(st.session_state[image_key], width=image.width)
    col_1, col_2 = st.columns([0.9, 0.1])
    with col_1:
        query = display_guess_input("zoom_guess")
        provide_autofill("zoom_guess", query, data["name"].unique())
    with col_2:
        game_in_progress = display_zoom_increment_submit(query, record["name"], zoom_key,
                                                         image_key, image)
    if game_in_progress is None:
        pass


if __name__ == "__main__":
    serve_page()
