## Getting Started Using Docker (Work In Progress)

1. Install [Docker](https://www.docker.com/).
1. [TODO] Postgresql instructions TBD. Currently you must use Neon for database if using Docker.
1. Create file `.env.local` in the repository root, and:
    - If you are an active Yuanjian volunteer, copy content from [this Notion page]().
    - Otherwise, copy content from [`.env.template`](.env.template) and configure required fields.
2. Run `yarn docker-dev`.
3. Visit [`localhost:3000`](http://localhost:3000) from broswer. Sign up with your personal email address.