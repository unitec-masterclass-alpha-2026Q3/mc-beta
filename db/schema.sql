CREATE TABLE
    albums (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        artist VARCHAR(200) NOT NULL,
        release_year INTEGER NOT NULL CHECK (release_year BETWEEN 1900 AND 2100)
    );

CREATE TABLE
    songs (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        album_id INTEGER NOT NULL REFERENCES albums (id) ON DELETE CASCADE,
        track_number INTEGER NOT NULL CHECK (track_number > 0),
        title VARCHAR(200) NOT NULL,
        UNIQUE (album_id, track_number)
    );