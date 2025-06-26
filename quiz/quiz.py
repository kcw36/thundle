"""Script for serving a quiz."""

import streamlit as st
from fuzzywuzzy import fuzz

from data import get_data, get_random_record

def serve_quiz():
    """Serve the quiz frontend."""
    data = get_data(mode="ground")
    record = get_random_record(data)

    if "guess" not in st.session_state:
        st.session_state["guess"] = ""

    col_1, col_2 = st.columns([0.9, 0.1])
    with col_1:
        query = display_guess_input()
        provide_autofill(query, data["name"].unique())
    with col_2:
        submit = st.button(label="→")

    if submit:
        if query.lower() == record["name"].lower():
            st.success("Correct.")
        else:
            st.warning("Incorrect.")

    st.text(record["name"])

    st.image(record["image_url"])

    col_1, col_2, col_3, col_4, col_5 = st.columns(5)

    with col_1:
        st.text(record["is_event"])
    with col_2:
        st.text(record["is_marketplace"])
    with col_3:
        st.text(record["is_premium"])
    with col_4:
        st.text(record["is_pack"])
    with col_5:
        st.text(record["is_squadron"])




def display_guess_input() -> str:
    """Display guess input with autocomplete suggestions."""
    query = st.text_input(label="guess",
                          placeholder="Guess...",
                          label_visibility="collapsed",
                          value=st.session_state["guess"] )
    return query


def provide_autofill(query: str, options: list[str]):
    """Provide guess input autofill options."""
    if query:
        matches = sorted([opt for opt in options if fuzz.ratio(opt.lower(), query.lower()) >= 0.5],
                         key=lambda x: fuzz.ratio(x, query.lower()),
                         reverse=True)
        for match in matches[:5]:
            if st.button(match):
                st.session_state["guess"] = match
                st.rerun()
                query = match
                st.success(f"You selected: {match}")


if __name__ == "__main__":
    serve_quiz()