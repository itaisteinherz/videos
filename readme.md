# videos [![Build Status](https://travis-ci.org/itaisteinherz/videos.svg?branch=master)](https://travis-ci.org/itaisteinherz/videos)

> Download videos from YouTube


## Install

```
$ npm install videos
```


## Usage

```js
const videos = require("videos");

const download = videos("https://youtu.be/q6EoRBvdVPQ", "AIzaSyDIWDAP9xcj2cVu6TCY8z2uVH6Nb7TqUIM", "~/Music");

download.onProgress(progress => {
	// Display download progress...
});

download.then(() => {
	// Download finished...
});

download.catch(err => {
	// Display error downloading...
});
```


## API

### videos(url, apiKey, videosPath, [options])

Returns an `Array<Promise>`.

#### url

Type: `string`

The url to the playlist or video you want to download.

#### apiKey

Type: `string`

The API key used to authenticate with the YouTube Data API.

For more information about creating API keys, check out [the API guide](https://developers.google.com/youtube/registering_an_application#Create_API_Keys).

#### videosPath

Type: `string`

The path to download videos to.

#### options

##### max

Type: `Number`<br>
Default: `5`<br>
Range: `0`-`50`

The maximum amount of videos to download from the given playlist url (this option will be ignored if a video url is given).


## Related

- [videos-cli](https://github.com/itaisteinherz/videos-cli) - CLI for this module


## License

MIT © [Itai Steinherz](https://github.com/itaisteinherz)
