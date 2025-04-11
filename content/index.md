v1: vanilla

```py
def danbooru(pixiv_id: str) -> dict[str, Any]:
    url = DANBOORU_SEARCH_URL.format(pixiv_id)
    result = {}

    try:
        response = requests.get(url)
        if response.status_code != 200:
            result[pixiv_id] = f"Error: HTTP {response.status_code}"
            return result
        result = danbooru_helper(pixiv_id, response)

    except requests.RequestException as e:
        result[pixiv_id] = f"Error: {str(e)}"
    return result
```

v2: add retries and logging

```py
def danbooru(
    pixiv_id: str, logger: logging.Logger, retries: int = 5, sleep_time: int = 5
) -> dict[str, Any]:
    url = DANBOORU_SEARCH_URL.format(pixiv_id)
    result = {}

    for _ in range(retries):
        try:
            response = requests.get(url)
            if response.status_code == 429:
                time.sleep(5)
                logger.info(f"HTTPS connection error: 429, sleep {sleep_time}s and retry")
                continue
            elif response.status_code != 200:
                result[pixiv_id] = f"HTTPS connection error: code {response.status_code}"
                return result
            else:
                result = danbooru_helper(pixiv_id, response)

        except requests.RequestException as e:
            result[pixiv_id] = f"Error: {str(e)}"

    result[pixiv_id] = "Error: Exceeded retry limit"
    logger.error(f"HTTPS connection error when retrieving '{pixiv_id}': exceeded retry limit")
    return result
```

v3: standalone retry_request and status code handler

```py
def danbooru(
    pixiv_id: str, logger: logging.Logger, retry: int = 5, sleep_time: int = 5
) -> dict[str, Any]:
    url = DANBOORU_SEARCH_URL.format(pixiv_id)
    response = retry_request(url, logger, retry, sleep_time)

    if response.status_code != 200:
        return {pixiv_id: f"HTTPS connection error with code {response.status_code}"}

    return danbooru_helper(pixiv_id, response)


def retry_request(
    url: str, logger: logging.Logger, retries: int, sleep_time: int
) -> requests.Response:
    response = requests.Response()
    response.status_code = 500  # Default to an error status code
    try:
        for attempt in range(retries):
            response = requests.get(url, stream=True)
            # Break if success (200), go to next iteration if (429), leave if any error.
            if response.status_code == 200:
                break
            elif response.status_code == 429:
                time.sleep(sleep_time)
                logger.info(
                    f"Rate limit exceeded (429). Sleeping for {sleep_time}s. Attempt {attempt + 1}/{retries}."
                )
            else:
                logger.error(f"Failed to retrieve URL after {retries} attempts: '{url}'")
                break
    except requests.RequestException as e:
        logger.error(f"Failed to retrieve '{url}': {e}")
        
    return response
```

耦合功能問題

```py
def get_tagged_path(base_path: Path, file_tags: list[str], tags: dict[str, str]) -> Optional[Path]:
    """Return the target folder path based on the file tags."""
    for tag in file_tags:
        if tag in tags:
            target_folder = Path(base_path) / tags[tag]
            target_folder.mkdir(parents=True, exist_ok=True)
            return target_folder
    return None
```
