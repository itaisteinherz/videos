#!/usr/bin/env node
"use strict";
const meow = require("meow");
const videos = require(".");

const cli = meow(`
	Usage
	  $ videos <playlist_url> <api_key> <videos_path>

	Options
	  --max  The maximum amount of videos to download from the given playlist url [Default: 5]

	Examples
	  $ videos https://youtu.be/q6EoRBvdVPQ AIzaSyDIWDAP9xcj2cVu6TCY8z2uVH6Nb7TqUIM ~/Videos
	  $ videos --max=1 https://youtu.be/q6EoRBvdVPQ?list=PL7XlqX4npddfrdpMCxBnNZXg2GFll7t5y AIzaSyDIWDAP9xcj2cVu6TCY8z2uVH6Nb7TqUIM ~/Music
`);

const url = cli.input[0];
const apiKey = cli.input[1];
const videosPath = cli.input[2];
const opts = cli.flags;

videos(url, apiKey, videosPath, opts);
