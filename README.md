# alphaville-blogs

Renders the pages of alphaville blogs: Homepage, article page.

## prerequiste
mongodb http://treehouse.github.io/installation-guides/mac/mongo-mac.html
mongod will start the db on the default port.

```
brew update 

brew install mongodb

mkdir -p /data/db

sudo chown -R `id -un` /data/db

mongod

```

Origami build tools https://github.com/Financial-Times/origami-build-tools#usage

```
npm install -g origami-build-tools
```

Install prerequisites of origami build tools:

```
obt install
```

Install gulp globally:

```
npm install -g gulp
```

## Install
Run the following:

You'll need to create environment variable

The fastest way to do this is to run the following assuming your are logged in into heroku

```
heroku config -s  >> .env --app av2-blogs-test
```
Define the local database URL 

```
DATABASE_URL="mongodb://localhost:27017/av2-blogs-test"
```

Now run the initial npm install on the app

```
npm install
```

This will not just install npm modules, but automatically run bower install and gulp build as well.

The build integrates origami build tools, so before this please make sure you have all the prerequisites needed for it: https://github.com/Financial-Times/origami-build-tools#usage



## Start the app

Run the following:

```
heroku local
```

### Article access

In order you to be able to access articles without getting the barrier, you will need 2 things:

1. Set up a URL in the hosts file that points `local.ft.com` to the localhost
2. Add `SKIP_AUTH=true` environment variable (this is needed because running the app locally there's no fastly service in front of the app to set the Decision header from the Access service).

### Using alpavhille services together

If you'd like to use other alphaville services locally with the blogs app (alphaville-es-interface-service, alphaville-marketslive-service), then you'll need to change their relevant environment variable, and change the URL and the relevant key to point to the local app you've set up:

- `AV_ES_SERVICE_KEY` and `AV_ES_SERVICE_URL` for *alphaville-es-interface-service*
- `ML_API_URL` for *alphaville-marketslive-service*
