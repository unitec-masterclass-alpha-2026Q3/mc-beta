const express = require("express");
const pool = require("./db");

const app = express();
const PORT = 3000;

app.use(express.json());

// Serve the Music Library frontend; all API routes below stay available.
app.use(express.static(require("path").join(__dirname, "public")));

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Music Library API",
  });
});

app.get("/albums", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM albums");

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Database error",
    });
  }
});
app.get("/albums/:id", async (req, res) => {
    try {
        const albumId = req.params.id;
        const result = await pool.query(
            "SELECT * FROM albums WHERE id = $1",
            [albumId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Album not found" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database error" });
    }
});

app.post("/albums", async (req, res) => {
  try {
    const { title, artist, year } = req.body;

    const result = await pool.query(
      `
      INSERT INTO albums (title, artist, year)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [title, artist, year]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Database error: "+ error.message,
    });
  }
});

app.delete("/albums/:id", async (req, res) => {
  try {
    const albumId = req.params.id;

    const result = await pool.query(
      `
      DELETE FROM albums
      WHERE id = $1
      RETURNING *
      `,
      [albumId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Album not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Database error",
    });
  }
});

app.put("/albums/:id", async (req, res) => {
  try {
    const albumId = req.params.id;
    const { title, artist, year } = req.body;

    const result = await pool.query(
      `
      UPDATE albums
      SET title = $1,
          artist = $2,
          year = $3
      WHERE id = $4
      RETURNING *
      `,
      [title, artist, year, albumId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Album not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Database error",
    });
  }
});

app.get("/albums/:id/songs", async (req, res) => {
    try {
        const albumId = req.params.id;
        const result = await pool.query( // ` multiple lines
            `
            SELECT id, album_id, track_number, title
            FROM songs
            WHERE album_id = $1
            ORDER BY track_number
            `,
            [albumId]
        );
    res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database error" });
    }
});
app.post("/albums/:albumId/songs", async (req, res) => {
  try {
    const albumId = req.params.albumId;
    const { track_number, title, duration_seconds } = req.body;

    const result = await pool.query(
      `
      INSERT INTO songs (album_id, track_number, title, duration_seconds)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [albumId, track_number, title, duration_seconds]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Database error",
    });
  }
});
app.get("/albums/:albumId/songs/:songId", async (req, res) => {
  try {
    const albumId = req.params.albumId;
    const songId = req.params.songId;

    const result = await pool.query(
      `
      SELECT *
      FROM songs
      WHERE id = $1
        AND album_id = $2
      `,
      [songId, albumId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Song not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Database error",
    });
  }
});

app.put("/albums/:albumId/songs/:songId", async (req, res) => {
  try {
    const albumId = req.params.albumId;
    const songId = req.params.songId;

    const { track_number, title, duration_seconds } = req.body;

    const result = await pool.query(
      `
      UPDATE songs
      SET track_number = $1,
          title = $2,
          duration_seconds = $3
      WHERE id = $4
        AND album_id = $5
      RETURNING *
      `,
      [track_number, title, duration_seconds, songId, albumId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Song not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Database error",
    });
  }
});

app.delete("/albums/:albumId/songs/:songId", async (req, res) => {
  try {
    const albumId = req.params.albumId;
    const songId = req.params.songId;

    const result = await pool.query(
      `
      DELETE FROM songs
      WHERE id = $1
        AND album_id = $2
      RETURNING *
      `,
      [songId, albumId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Song not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Database error",
    });
  }
});



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});