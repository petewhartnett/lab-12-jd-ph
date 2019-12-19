CREATE TABLE IF NOT EXISTS books(
id SERIAL PRIMARY KEY,
author VARCHAR(255),
title VARCHAR(255),
isbn VARCHAR(255),
image_url VARCHAR(255),
summary TEXT,
category VARCHAR(255)
);

INSERT INTO books (author, title, isbn, image_url, summary, category)
VALUES('Charles Dickens', 'Moby Dick', '000000001', 'https://via.placeholder.com/250', 'Best book ever', 'fiction');
INSERT INTO books (author, title, isbn, image_url, summary, category)
VALUES('Charles D', 'Moby ', '2', 'https://via.placeholder.com/150', 'Worst book ever', 'non fiction');