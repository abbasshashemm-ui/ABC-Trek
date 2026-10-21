# Photo drop folder

**Current setup:** `manifest.json` lists exactly which photo goes on which day (with alt text and
whether it's one of ours, plus an optional `"focus": "50% 70%"` to keep a subject in frame when a
tile crops the photo). Edit it, then run `npm run photos`. Send originals at least 1600px wide:
anything under ~1200px looks soft on phones and the script warns about it. Files not listed there are ignored.
Without a manifest, the folder convention below is used instead.

Put raw photos (JPG, PNG, HEIC from iPhone, even .MOV clips) into the folder for the place
they were taken, then run `npm run photos`. Originals are never served; the script writes
resized WebP files to `public/photos/`.

| folder        | shown on days |
|---------------|---------------|
| `kathmandu`   | 1, 2, 14      |
| `chitwan`     | 3, 4          |
| `pokhara`     | 5, 6, 13      |
| `sinuwa`      | 7, 10         |
| `deurali`     | 8             |
| `abc`         | 9             |
| `jhinu-danda` | 11            |
| `landruk`     | 12            |
| `beirut`      | 15            |
| `trek`        | tops up trail days 7–12 |

Photos without an entry in that folder's `credits.json` are credited to Hmayed & Farhat.
Anything from the internet MUST have an entry (author, license, source URL): only use
images whose licence allows commercial use (e.g. Wikimedia Commons CC BY / CC BY-SA / CC0,
Unsplash, Pexels). "Found on Google" is not a licence.
