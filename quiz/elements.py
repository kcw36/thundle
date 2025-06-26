"""Module for serving quiz elements."""

from requests import get
from io import BytesIO
from PIL import Image, ImageFilter

import streamlit as st
from fuzzywuzzy import fuzz

def display_image(url: str):
    """Display image."""
    img = get_image(url)
    if "image" not in st.session_state:
        st.session_state["image"] = get_blurred_image(img)
    st.image(st.session_state["image"])
    if st.button("Reveal Image."):
        st.session_state["image"] = img


@st.cache_data
def get_image(url: str) -> Image:
    """Return image as image file from url."""
    return Image.open(BytesIO(get(url).content))


@st.cache_data
def get_blurred_image(_img: Image) -> Image:
    """Return blurred image as image file from url."""
    return _img.filter(ImageFilter.GaussianBlur(radius=10))


def update_state(key, value):
    st.session_state[key] = value


def display_complex_buttons(record: dict):
    """Display complex buttons."""
    defaults = {
        "country": "Country?",
        "vehicle_type": "Vehicle Type??",
        "br": "BR?",
        "release": "Release Date?",
    }

    for key, default in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = default

    st.button(
        st.session_state["country"],
        key="country_button",
        on_click=update_state,
        args=("country", str(record["country"])),
    )

    st.button(
        st.session_state["vehicle_type"],
        key="vehicle_type_button",
        on_click=update_state,
        args=("vehicle_type", str(record["vehicle_type"])),
    )

    st.button(
        st.session_state["br"],
        key="br_button",
        on_click=update_state,
        args=("br", str(record["realistic_ground_br"])),
    )

    st.button(
        st.session_state["release"],
        key="release_button",
        on_click=update_state,
        args=("release", record["release_date"].strftime(r"%B %d, %Y")),
    )


def display_bool_buttons(record: dict):
    """Display buttons with boolean context."""
    defaults = {
        "is_event": "Event?",
        "is_marketplace": "Marketplace?",
        "is_premium": "Premium?",
        "is_pack": "Pack?",
        "is_squadron": "Squadron?",
    }

    for key, default in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = default

    col_1, col_2, col_3, col_4, col_5 = st.columns(5)

    with col_1:
        st.button(
            st.session_state["is_event"],
            key="event_button",
            on_click=update_state,
            args=("is_event", str(record["is_event"])),
        )

    with col_2:
        st.button(
            st.session_state["is_marketplace"],
            key="marketplace_button",
            on_click=update_state,
            args=("is_marketplace", str(record["is_marketplace"])),
        )

    with col_3:
        st.button(
            st.session_state["is_premium"],
            key="premium_button",
            on_click=update_state,
            args=("is_premium", str(record["is_premium"])),
        )

    with col_4:
        st.button(
            st.session_state["is_pack"],
            key="pack_button",
            on_click=update_state,
            args=("is_pack", str(record["is_pack"])),
        )

    with col_5:
        st.button(
            st.session_state["is_squadron"],
            key="squadron_button",
            on_click=update_state,
            args=("is_squadron", str(record["is_squadron"])),
        )


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
        i = len(query)
        matches = sorted([opt for opt in options if fuzz.ratio(opt[:i].lower(), query.lower()) >= 0.5],
                         key=lambda x: fuzz.ratio(x[:i], query.lower()),
                         reverse=True)
        for match in matches[:5]:
            if st.button(match):
                st.session_state["guess"] = match
                st.rerun()
                query = match
                st.success(f"You selected: {match}")
