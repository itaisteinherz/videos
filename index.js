"use strict";
const fs = require("fs");
const path = require("path");

const pify = require("pify");
const google = require("googleapis");
const urlParser = require("js-video-url-parser");
const isPlaylist = require("is-playlist");
const ytdl = require("ytdl-core");

let youtube;

function downloadVideo(url, ext) {
	const opts = {
		filter: format => format.bitrate && format.container === ext // NOTE: This was taken from https://github.com/fent/node-ytdl/blob/master/bin/ytdl.js#L248.
	};

	return ytdl(url, opts);
}

module.exports = (url, apiKey, videosPath, opts) => { // TODO: Suport using an OAUTH 2.0 token instead of an API key from authentication.
	opts = opts || {}; // TODO: Check if I should validate the options' types as well.

	if (typeof url !== "string") {
		throw new TypeError(`Expected \`url\` to be a \`string\`, got \`${typeof url}\``);
	}

	if (typeof apiKey !== "string") {
		throw new TypeError(`Expected \`apiKey\` to be a \`string\`, got \`${typeof apiKey}\``);
	}

	if (typeof videosPath !== "string") {
		throw new TypeError(`Expected \`videosPath\` to be a \`string\`, got \`${typeof videosPath}\``);
	}

	const videoInfo = urlParser.parse(url);

	if (videoInfo.provider !== "youtube") {
		throw new Error(`Expected a video from Youtube, got video from ${videoInfo.provider}`);
	}

	if (["playlist", "video"].indexOf(videoInfo.mediaType) === -1) {
		throw new Error(`Expected a video url, got url to ${videoInfo.mediaType}`); // TODO: Throw error if the given `url` parameter is not an url using the `is-url-superb` package.
	}

	youtube = google.youtube({
		version: "v3",
		auth: apiKey
	});

	if (!isPlaylist(url)) {
		const videoOpts = {
			key: apiKey,
			id: videoInfo.id,
			part: "snippet"
		};

		return pify(youtube.videos.list)(videoOpts)
			.then(results => {
				const videoTitle = results.items[0].snippet.title;

				const ext = "mp4"; // TODO: Get this from the user instead of hardcoding it.

				const videoPath = path.join(videosPath, `${videoTitle}.${ext}`);

				const download = downloadVideo(url, ext); // TODO: Add support for other formats, including music-only ones. Also, address the issue in https://github.com/fent/node-ytdl-core#handling-separate-streams.

				download.pipe(fs.createWriteStream(videoPath)); // TODO: Check if I should leave this part to the user, instead of doing it in the module.

				return {
					downloadStream: download,
					videoTitle,
					videoUrl: url
				};
			});
	}

	const playlistId = videoInfo.list;

	opts.max = Math.min(Math.max((opts.max || 5), 0), 50);

	const playlistOpts = {
		key: apiKey,
		playlistId,
		part: "id,snippet",
		maxResults: opts.max || 5
	};

	return pify(youtube.playlistItems.list)(playlistOpts)
		.then(results => {
			const downloads = [];

			for (const video of results.items) {
				const videoId = video.snippet.resourceId.videoId;
				const videoTitle = video.snippet.title;

				const ext = "mp4"; // TODO: Get this from the user instead of hardcoding it.

				const videoUrl = `https://youtu.be/${videoId}`;

				const videoPath = path.join(videosPath, `${videoTitle}.${ext}`);

				const download = downloadVideo(videoUrl, ext); // TODO: Add support for other formats, including music-only ones. Also, move to downloading videos synchronously rather than asynchronously.

				download.pipe(fs.createWriteStream(videoPath));

				downloads.push({
					downloadStream: download,
					videoTitle,
					videoUrl
				});
			}

			return downloads;
		});
};
