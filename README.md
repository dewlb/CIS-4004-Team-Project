# Welcome to our CIS 4004 Team Project!

# Team Setup Guide

## Accessing the Repository
Once you have been added as a collaborator, clone the repository to your computer:

```bash
git clone https://github.com/dewlb/CIS-4004-Team-Project.git
cd CIS-4004-Team-Project
```

## Installing Dependencies
Dependencies need to be installed in each folder separately.

### Install server dependencies
```bash
cd server
npm install
```

### Install client dependencies
```bash
cd ../client
npm install
```

## Running the Project

### Start the server
From the `server` folder, in your terminal, run:

```bash
npm start
```

### Start the React client
From the `client` folder, also in your terminal, run:

```bash
npm run dev
```

Front end can be accessed at local host port 5173 and backend is port 8080.

Our Mongo DB collections include Users, Groups, Classes, Tasks, and UserBadge.

## Team Workflow
To avoid conflicts, do not work directly on the `main` branch.

Before starting a new task, create your own branch:

```bash
git checkout -b your-name-feature
```

Example:

```bash
git checkout -b ethan-login-page
```

Make your changes, then save and commit them:

```bash
git add .
git commit -m "I changed blah blah blah"
```

Push your branch to GitHub:

```bash
git push origin your-name-feature
```

After pushing, go to GitHub and open a Pull Request to merge your branch into `main`.

## Pulling Latest Changes
**Before starting new work**, (I forget this all the time), make sure your local `main` branch is up to date:

```bash
git checkout main
git pull origin main
```

Then create a new branch from the updated `main`:

```bash
git checkout -b your-name-feature
```

## Important Notes
Do not upload the following files or folders to GitHub:
- `node_modules`
- `.env`
- build output folders like `dist` or `build`
- API keys (common web design joke rn), passwords, or database credentials

## Suggested Communication
If you start making something new or working on a branch, send us a message in the discord so we don't have conflicts merging later on.
