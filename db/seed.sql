-- ============================================
-- MC - Music Collection
-- Sample Database Seed
-- ============================================

-- Albums

INSERT INTO albums (title, artist, release_year)
VALUES
    ('Abbey Road', 'The Beatles', 1969),
    ('The Dark Side of the Moon', 'Pink Floyd', 1973),
    ('Moving Pictures', 'Rush', 1981),
    ('Master of Puppets', 'Metallica', 1986);


-- Songs
-- Abbey Road

INSERT INTO songs (album_id, track_number, title)
VALUES
    (1, 1, 'Come Together'),
    (1, 2, 'Something'),
    (1, 3, 'Maxwell''s Silver Hammer'),
    (1, 4, 'Oh! Darling'),
    (1, 5, 'Octopus''s Garden');


-- The Dark Side of the Moon

INSERT INTO songs (album_id, track_number, title)
VALUES
    (2, 1, 'Speak to Me'),
    (2, 2, 'Breathe'),
    (2, 3, 'On the Run'),
    (2, 4, 'Time'),
    (2, 5, 'The Great Gig in the Sky');


-- Moving Pictures

INSERT INTO songs (album_id, track_number, title)
VALUES
    (3, 1, 'Tom Sawyer'),
    (3, 2, 'Red Barchetta'),
    (3, 3, 'YYZ'),
    (3, 4, 'Limelight'),
    (3, 5, 'The Camera Eye');


-- Master of Puppets

INSERT INTO songs (album_id, track_number, title)
VALUES
    (4, 1, 'Battery'),
    (4, 2, 'Master of Puppets'),
    (4, 3, 'The Thing That Should Not Be'),
    (4, 4, 'Welcome Home (Sanitarium)'),
    (4, 5, 'Disposable Heroes');