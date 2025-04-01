# Block37A_Unit4CareerSimulation

## Users <br />
id (PRIMARY KEY, UUID, unique) <br />
username (Unique, varchar(255), not null) <br />
email (Unique, varchar(255), not null) <br />
password_hash (varchar(255), not null) <br />
created_at (timestamp, default now()) <br />
updated_at (timestamp, default now()) <br />

## Items <br />
id (PRIMARY KEY, UUID, unique) <br />
name (Unique, varchar(255), not null) <br />
description (text) <br />
average_rating (float (2,1), default 0.0) <br />
created_at (timestamp, default now()) <br />
updated_at (timestamp, default now()) <br />

## Reviews <br />
id (PRIMARY KEY, UUID, unique) <br />
user_id (FOREIGN KEY → users.id, not null, ON DELETE CASCADE) <br />
item_id (FOREIGN KEY → items.id, not null, ON DELETE CASCADE) <br />
rating (integer, 1-5, not null) <br />
review_text (text, not null) <br />
created_at (timestamp, default now()) <br />
updated_at (timestamp, default now()) <br />

## Comments <br />
id (PRIMARY KEY, UUID, unique) <br />
user_id (FOREIGN KEY → users.id, not null, ON DELETE CASCADE) <br />
review_id (FOREIGN KEY → reviews.id, not null, ON DELETE CASCADE) <br />
comment_text (text, not null) <br />
created_at (timestamp, default now()) <br />
updated_at (timestamp, default now()) <br />
