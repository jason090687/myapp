import requests
import os
import re
from tqdm import tqdm

SEARCH_URL = "https://openlibrary.org/search.json"

SAVE_FOLDER = "book_covers"
os.makedirs(SAVE_FOLDER, exist_ok=True)

queries = [
"science","technology","history","fiction","fantasy","romance",
"philosophy","psychology","business","economics","biology",
"chemistry","physics","medicine","religion","bible",
"art","music","education","politics"
]

limit = 1000

for query in queries:

    params = {
        "q": query,
        "limit": limit
    }

    response = requests.get(SEARCH_URL, params=params)
    data = response.json()

    for book in tqdm(data["docs"], desc=query):

        if "cover_i" not in book:
            continue

        cover_id = book["cover_i"]

        title = re.sub(r'[\\/*?:"<>|]', "", book.get("title", "unknown"))[:120]

        cover_url = f"https://covers.openlibrary.org/b/id/{cover_id}-L.jpg"

        r = requests.get(cover_url)

        if r.status_code == 200:

            filepath = os.path.join(SAVE_FOLDER, f"{title}.jpg")

            with open(filepath, "wb") as f:
                f.write(r.content)