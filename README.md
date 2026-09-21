# Music Library

A Node.js/Express/PostgreSQL music collection with a Bootstrap 5 and vanilla JavaScript frontend.

Run `npm install`, ensure PostgreSQL matches the connection settings in `db.js`, then run `npm run dev`. Open **http://localhost:3000**.

- Browse, search, sort, add, edit, and delete albums on `/`.
- Open an album to manage its tracks on `/album.html?id=1`.
- All writes use the existing REST API. Delete dialogs require confirmation.
- Bootstrap 5.3.3 assets are included locally in `public/vendor` (MIT licensed).

## Frontend files

`public/index.html` and `public/album.html` contain the pages and Bootstrap forms. `public/css/styles.css` adds the record-library theme. `public/js/albums.js` handles the collection; `public/js/album.js` handles tracks. `public/js/common.js` contains the fetch/error helper and shared album and confirmation forms. Album artwork is decorative CSS, not fetched cover art.

The song-list API omits `duration_seconds`, so the details page retrieves individual songs as needed to display durations while preserving the API's track order. Unknown durations display as a dash.

## Database compatibility

The current API expects `albums.year` and `songs.duration_seconds`. The checked-in `db/schema.sql` and `db/seed.sql` describe an older schema with `release_year` and no duration column. They have been left unchanged. Do not use those older SQL files to recreate the current API database without reconciling that difference. The frontend also displays `release_year` if returned by an older database, but API writes still use the documented `year` field.
