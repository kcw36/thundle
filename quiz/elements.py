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
        update_state("image", get_blurred_image(img, 100))

    st.image(st.session_state["image"])

    st.button(
        "Reveal Image.",
        key="reveal_image_button",
        on_click=update_state,
        args=("image", get_blurred_image(img, 10), 35),
    )


def get_image(url):
    headers = {
        "User-Agent": "Mozilla/5.0",  # look like a browser
        "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        "Referer": "https://wtvehiclesapi.sgambe.serv00.net/"  # defeats anti-hot-linking
    }
    r = get(url, headers=headers, timeout=10)
    if r.status_code != 200 or "image" not in r.headers.get("Content-Type", ""):
        st.write("Status:", r.status_code, "Content-Type:", r.headers.get("Content-Type"))
        raise ValueError("Remote server did not return an image")
    return Image.open(BytesIO(r.content))


def get_blurred_image(_img: Image, blur: int) -> Image:
    """Return blurred image as image file from url."""
    return _img.filter(ImageFilter.GaussianBlur(radius=blur))


def update_state(key: str, value, score: int=None):
    st.session_state[key] = value
    if score:
        st.session_state["score"] -= score


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
        args=("country", str(record["country"]), 10),
    )

    st.button(
        st.session_state["vehicle_type"],
        key="vehicle_type_button",
        on_click=update_state,
        args=("vehicle_type", str(record["vehicle_type"]), 10),
    )

    st.button(
        st.session_state["br"],
        key="br_button",
        on_click=update_state,
        args=("br", str(record["realistic_ground_br"]), 10),
    )

    st.button(
        st.session_state["release"],
        key="release_button",
        on_click=update_state,
        args=("release", record["release_date"].strftime(r"%B %d, %Y"), 10),
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
            args=("is_event", str(record["is_event"]), 5),
        )

    with col_2:
        st.button(
            st.session_state["is_marketplace"],
            key="marketplace_button",
            on_click=update_state,
            args=("is_marketplace", str(record["is_marketplace"]), 5),
        )

    with col_3:
        st.button(
            st.session_state["is_premium"],
            key="premium_button",
            on_click=update_state,
            args=("is_premium", str(record["is_premium"]), 5),
        )

    with col_4:
        st.button(
            st.session_state["is_pack"],
            key="pack_button",
            on_click=update_state,
            args=("is_pack", str(record["is_pack"]), 5),
        )

    with col_5:
        st.button(
            st.session_state["is_squadron"],
            key="squadron_button",
            on_click=update_state,
            args=("is_squadron", str(record["is_squadron"]), 5),
        )


def display_guess_input() -> str:
    """Display guess input with autocomplete suggestions."""
    query = st.text_input(label="guess",
                          placeholder="Guess...",
                          label_visibility="collapsed",
                          value=st.session_state["guess"])
    return query


def provide_autofill(query: str, options: list[str]):
    """Provide guess input autofill options."""
    if query:
        i = len(query)
        matches = sorted([opt for opt in options if fuzz.ratio(opt[:i].lower(), query.lower()) >= 0.5],
                         key=lambda x: fuzz.ratio(x[:i], query.lower()),
                         reverse=True)
        for match in matches[:5]:
            st.button(
                match,
                key=match,
                on_click=update_state,
                args=("guess", match),
            )
