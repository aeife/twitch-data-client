# twitch-data-client

This is the client side application for [TTV Stats](ttvstats.com). It is based on AngularJS and communicates with various APIs to gather the displayed data.

#### other twitchdata repositories
* [twitch-data-collector](https://github.com/aeife/twitch-data-collector)
* [twitch-data-api](https://github.com/aeife/twitch-data-api)

### Browser compatibility
Support is targeted for all common, modern browsers and screen sizes. Browser compatibility is tested via [Browserstack](http://example.net/).

<img src="./src/images/browserstack.png" width="250">

### Development
Steps to run this project in a local dev environment

1. ```npm install```

  installs development dependencies

2. ```bower install```

  installs client dependencies

3. ```npm install -g gulp```

  needed to run the automated tasks

4. ```gulp dev```

  runs tests, builds the project and start a webserver to serve the current build
