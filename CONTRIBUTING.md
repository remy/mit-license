# Development environment setup

With [Node.js](https://nodejs.dev) installed, [`git clone` the repository](https://docs.github.com/en/github/creating-cloning-and-archiving-repositories/cloning-a-repository-from-github/cloning-a-repository#cloning-a-repository) then run `npm install` and `npm run dev` to start the development server.

# Merging user updates

If you are a collaborator (with push permissions), you can merge any open PR with the following conditions:

1. It passes the JSON validity test (this is a GitHub integration in Travis CI)
2. It adds or updates a `<user>.json` file

If you're unsure, cc @remy into the PR with a question and we can work out what to do.

The site is hosted on Heroku and will automatically deploy merges into master, which means once a PR is merged, it'll be live shortly thereafter (so there's nothing to do 🎉).

Also, thank you, your help is appreciated 💙
