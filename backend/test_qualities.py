import urllib.request
import json

BASE = "http://localhost:8000"
URL  = "https://www.youtube.com/watch?v=jNQXAC9IVRw"

def post(endpoint, body):
    req = urllib.request.Request(
        BASE + endpoint,
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    try:
        resp = urllib.request.urlopen(req, timeout=120)
        return json.loads(resp.read()), None
    except urllib.error.HTTPError as e:
        return None, "HTTP {}: {}".format(e.code, e.read().decode())
    except Exception as e:
        return None, str(e)

print("=" * 50)
print("ANALYZE TEST")
print("=" * 50)
data, err = post("/api/analyze", {"url": URL})
if err:
    print("FAIL:", err)
else:
    print("Title   :", data["title"])
    print("Qualities:", data["qualities"])
    print("Formats  :", data["formats"])

print()
print("=" * 50)
print("VIDEO QUALITY TESTS")
print("=" * 50)

qualities = ["best", "1080p", "720p", "360p"]
for q in qualities:
    print("Testing quality:", q, "...", end=" ", flush=True)
    data, err = post("/api/download/video", {"url": URL, "quality": q, "format": "video"})
    if err:
        print("FAIL -", err)
    else:
        size_mb = round(data["size"] / 1024 / 1024, 2)
        print("OK - {} | {}MB".format(data["filename"], size_mb))

print()
print("=" * 50)
print("AUDIO TEST")
print("=" * 50)
print("Testing audio (MP3) ...", end=" ", flush=True)
data, err = post("/api/download/audio", {"url": URL, "quality": "best", "format": "mp3"})
if err:
    print("FAIL -", err)
else:
    size_mb = round(data["size"] / 1024 / 1024, 2)
    print("OK - {} | {}MB".format(data["filename"], size_mb))

print()
print("All tests done.")
