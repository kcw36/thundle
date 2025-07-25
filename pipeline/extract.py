"""Module for extracting information from war thunder api."""

from json import dumps
from logging import getLogger

from requests import get


def get_response_page(pg_no: int) -> list[dict]:
    """Return api response for given page number."""
    logger = getLogger()
    logger.info("Sending request to API for page: %s", pg_no)
    payload = {"limit": 200, "page": pg_no}
    response = get("https://www.wtvehiclesapi.sgambe.serv00.net/api/vehicles",
                   params=payload,
                   timeout=10)
    return response.json()


def extract(n: int = 0, m: int = 14) -> list[dict]:
    """Return api response for all vehicles on pages n to m."""
    logger = getLogger()
    logger.info("Sending full request set to API: page %s to %s", n, m)
    full_response = []
    for i in range(n, m+1):
        full_response.extend(get_response_page(i))
    return full_response


if __name__ == "__main__":
    data = extract(0, 2)
    with open("example_response.json", "w", encoding="utf-8") as f:
        j_data = dumps(data, indent=4)
        f.write(j_data)
