# Block37A_Unit4CareerSimulation

# Table of Contents  
- DB Schema
- Unit Tests
  
## DB Schema

<img width="1280" alt="Screenshot 2025-03-31 at 9 50 46 AM" src="https://github.com/user-attachments/assets/a35519e8-3edf-4e2c-a312-3bcb9070a704" />

### Users <br />
id (PRIMARY KEY, UUID, unique) <br />
username (Unique, varchar(255), not null) <br />
email (Unique, varchar(255), not null) <br />
password_hash (varchar(255), not null) <br />
created_at (timestamp, default now()) <br />
updated_at (timestamp, default now()) <br />

### Items <br />
id (PRIMARY KEY, UUID, unique) <br />
name (Unique, varchar(255), not null) <br />
description (text) <br />
average_rating (numeric (2,1), default 0.0) <br />
created_at (timestamp, default now()) <br />
updated_at (timestamp, default now()) <br />

### Reviews <br />
id (PRIMARY KEY, UUID, unique) <br />
user_id (FOREIGN KEY → users.id, not null, ON DELETE CASCADE) <br />
item_id (FOREIGN KEY → items.id, not null, ON DELETE CASCADE) <br />
rating (integer, 1-5, not null) <br />
review_text (text, not null) <br />
created_at (timestamp, default now()) <br />
updated_at (timestamp, default now()) <br />

### Comments <br />
id (PRIMARY KEY, UUID, unique) <br />
user_id (FOREIGN KEY → users.id, not null, ON DELETE CASCADE) <br />
review_id (FOREIGN KEY → reviews.id, not null, ON DELETE CASCADE) <br />
comment_text (text, not null) <br />
created_at (timestamp, default now()) <br />
updated_at (timestamp, default now()) <br />

## UnitTests

POST /api/auth/register endpoint
- Success: Should register a user and return user information.
- Failure: Should return 400 error if missing required username field.
- Failure: Should return 400 error if missing required password field.\

POST /api/auth/login
- Success: Should authenticate the  user and return a JWT token..
- Failure: Should return a 401 error if the password is incorrect
- Failure: Should return a 404 error if the user does not exist.

GET /api/auth/me
- Success: Should return the logged-in user's details.
- Failure: Should return a 401 error if no token is provided.
- Failure: Should return a 403 error if an invalid token is used.
 
GET /api/items
- Success: Should return an array of items.
- If no items exist, then an empty array is returned.

GET /api/items/:itemId
- Success: Should return item details (name, description, average rating).
- Failure: Should return a 404 error if the item does not exist.

GET /api/items/:itemId/reviews
- Success: Should return an array of reviews for the item.
- If no reviews exist for the item, then an empty array is returned.
- Failure: Should return a 404 error if the item does not exist.

GET /api/items/:itemId/reviews/:reviewId
- Success: Should return the details of the review.
- Failure: Should return a 404 error if the review does not exist.

POST /api/items/:itemId/reviews
- Success: Should create a new review for an item.
- Failure: Should return a 401 error if the user is not logged in.
- Failure: Should return a 400 error if required fields are missing.
- Failure: Should return a 409 error if the user has already reviewed this item.
  
GET /api/reviews/me 🔒
- Success: Should return an array of the user's reviews.
- If the user has no reviews, then an empty array is returned.
- Failure: Should return a 401 error if no token is provided.

PUT /api/users/:userId/reviews/:reviewId
- Success: Should update the review's text or rating.
- Failure: Should return a 401 error if the user is not logged in.
- Failure: Should return a 403 error if the review does not belong to the user.
- Failure: Should return a 404 error if the review does not exist.
 
POST /api/items/:itemId/reviews/:reviewId/comments
- Success: Should create a new comment.
- Failure: Should return a 401 error if the user is not logged in.
- Failure: Should return a 400 error if required fields are missing.
- Failure: Should return a 404 error if the review does not exist.

GET /api/comments/me 
- Success: Should return an array of the user's comments.
- If the user has no comments, then an empty array is returned.
- Failure: Should return a 401 error if no token is provided.
  
PUT /api/users/:userId/comments/:commentId
- Success: Should update the comment.
- Failure: Should return a 401 error if the user is not logged in.
- Failure: Should return a 403 error if the comment does not belong to the user.
- Failure: Should return a 404 error if the comment does not exist.
  
DELETE /api/users/:userId/comments/:commentId
- Success: Should delete the comment.
- Failure: Should return a 401 error if the user is not logged in.
- Failure: Should return a 403 error if the comment does not belong to the user.
- Failure: Should return a 404 error if the comment does not exist.
  
DELETE /api/users/:userId/reviews/:reviewId
- Success: Should delete the review.
- Failure: Should return a 401 error if the user is not logged in.
- Failure: Should return a 403 error if the review does not belong to the user.
- Failure: Should return a 404 error if the review does not exist.
