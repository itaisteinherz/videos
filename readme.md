# videos [![Build Status](https://travis-ci.org/itaisteinherz/videos.svg?branch=master)](https://travis-ci.org/itaisteinherz/videos)

> Download videos from YouTube


## Install

```
$ npm install videos
```


## Usage

```js
const videos = require("videos");

const download = videos("https://youtu.be/q6EoRBvdVPQ", "KIzaSyDIWDAP8xcj2cVu6TBY8z2uVG6Nb7TqUIM", "/home/videos");

download.then(downloads => {
	downloads[0].onProgress(progress => {
		// Display download progress...
	});

	downloads[0].then(() => {
		// Download finished...
	});

	downloads[0].catch(err => {
		// Display error downloading...
	});
});
```


## API

### videos(url, apiKey, videosPath, [options])

Returns a `Promise` that is fulfilled when the url's metadata is fetched, or rejects if the fetching fails. The fulfilled value is an `Array` of [`PProgress`](https://github.com/sindresorhus/p-progress) promises which represent each video's download (in case the url is for a playlist) or the video's download (in case the url is for a video).

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

##### start

Type: `Number`<br>
Default: `0`<br>
Range: `0`-`50`

Index to start downloading videos at (this option will be ignored if a video url is given). Note that if `start` is negative, `0` will be used instead and if `start` is bigger than `50`, it will be used instead.

##### max

Type: `Number`<br>
Default: `5`<br>
Range: `0`-`50`

Maximum amount of videos to download from the given playlist url (this option will be ignored if a video url is given). Note that if `max` is negative, `0` will be used instead and if `max` is bigger than `50`, it will be used instead.

If the `start` and `max` options are specified and `start + max` is bigger than `50`, `50 - start` videos will be downloaded instead of `max`.


## Related

- [videos-cli](https://github.com/itaisteinherz/videos-cli) - CLI for this module


## License

MIT © [Itai Steinherz](https://github.com/itaisteinherz)
