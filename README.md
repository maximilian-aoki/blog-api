# Blog API

This repo contains a JSON REST API server which acts as the back-end for two separate front-end servers - one for public consumption of content and another for a private admin user. The REST API was built with Node, Express, Mongoose, Json Web Tokens, and Express-Validator.

Both front-end servers are fully responsive mobile-first React SPAs built with Vite, Tailwindcss, and React-Router.

### Public Front End

[Live Public Page](https://blog-public-maximilian.pages.dev/)
[Github repo](https://github.com/maximilian-aoki/blog-public)

Features:

- Read all published posts as a visitor or signed-in user
- Create/Edit/Delete comments as a signed-in user

### Admin Front End

[Live Admin Page](https://blog-private-maximilian.pages.dev/)
[Github repo](https://github.com/maximilian-aoki/blog-private)

Features:

- Access all published/unpublished posts
- Create/Edit/Delete posts and set their publish status
- Create/Edit/Delete own admin comments, and delete any other comment

## Back End Features

- Separate API routers for public and private page
- Authentication with timed JWTs on all auth routes
- Persistent data with MongoDB and Mongoose ORM
- CORS set up to only accept requests from the front-end servers

### Future Roadmap

- Add ability to host multiple admin users - everyone can have their own blog page
- Add ability to atlas-search the posts database for content based on text
- Add microinteractions to improve UI
- Add apicache middleware to common routes
