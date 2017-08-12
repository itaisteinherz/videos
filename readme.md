# videos [![Build Status](https://travis-ci.org/itaisteinherz/videos.svg?branch=master)](https://travis-ci.org/itaisteinherz/videos)

> Download videos from YouTube


## Install

```
$ npm install https://github.com/itaisteinherz/videos
```


## Usage

```js
const videos = require("videos");

videos("https://youtu.be/q6EoRBvdVPQ", "AIzaSyDIWDAP9xcj2cVu6TCY8z2uVH6Nb7TqUIM", "~/Music");
```


## API

### videos(url, apiKey, videosPath, [options])

#### url

Type: `string`

The url to the playlist or video you want to download.

#### apiKey

Type: `string`

The API key used to authenticate with the YouTube Data API.

#### videosPath

Type: `string`

The path to download videos to.

#### options

##### max

Type: `Number`<br>
Default: `5`<br>
Range: `0`-`50`

The maximum amount of videos to download from the given playlist url (this option will be ignored if a video url is given).


## CLI

```
$ npm install --global https://github.com/itaisteinherz/videos
```

```
$ videos --help

Usage
  $ videos <playlist_url> <api_key> <videos_path>

Options
  --max  The maximum amount of videos to download from the given playlist url [Default: 5]

Examples
  $ videos https://youtu.be/q6EoRBvdVPQ AIzaSyDIWDAP9xcj2cVu6TCY8z2uVH6Nb7TqUIM ~/Videos
  $ videos --max=1 https://youtu.be/q6EoRBvdVPQ?list=PL7XlqX4npddfrdpMCxBnNZXg2GFll7t5y AIzaSyDIWDAP9xcj2cVu6TCY8z2uVH6Nb7TqUIM ~/Music
```


## License

MIT © [Itai Steinherz](https://github.com/itaisteinherz)
