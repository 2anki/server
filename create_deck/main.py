"""
The new 2anki backend API.
"""
import fastapi

VERSION = "0.0.1"
description: str = """
The create_deck API helps you create Anki flashcards fast. 🌟
"""

tos: str = "https://alemayhu.notion.site/Terms-of-services" \
           "-931865161517453b99fb6495e400061d "

app = fastapi.FastAPI(
    title="create_deck API",
    description=description,
    version=VERSION,
    terms_of_service=tos,
    contact={
        "name": "Alexander Alemayhu",
        "url": "https://alemayhu.com",
        "email": "alexander@alemayhu.com"
    },
    license_info={
        "name": "MIT LICENSE",
        "url": "https://github.com/2anki/create_deck/blob/main/LICENSE"
    }
)


@app.get("/")
def read_version():
    """
    Endpoint for reading current version of the API.
    :return: version string
    """
    return VERSION.encode("utf-8")


@app.get("/checks")
def read_checks():
    """
    Endpoint used for performing health checks.
    :return: "create_deck" string
    """
    return "create_deck"
