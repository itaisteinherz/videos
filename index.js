"use strict";
const fs = require("fs");
const path = require("path");

const pify = require("pify");
const google = require("googleapis");
const urlParser = require("js-video-url-parser");
const isPlaylist = require("is-playlist");
const ytdl = require("ytdl-core");
const PProgress = require("p-progress");

let youtube;

function getUrlInfo(url, urlInfo, apiKey, opts) {
	if (!isPlaylist(url)) {
		const videoOpts = {
			key: apiKey,
			id: urlInfo.id,
			part: "snippet"
		};

		return pify(youtube.videos.list)(videoOpts).then(res => res.items);
	}

	const playlistOpts = {
		key: apiKey,
		playlistId: urlInfo.list,
		part: "id,snippet",
		maxResults: opts.max + opts.start <= 50 ? opts.max + opts.start : 50
	};

	return pify(youtube.playlistItems.list)(playlistOpts)
		.then(({items}) => items.length > opts.start ? items.slice(opts.start) : []);
}

function downloadVideo(url, ext, downloadPath) {
	const opts = {
		filter: format => format.bitrate && format.container === ext // NOTE: This was taken from https://github.com/fent/node-ytdl/blob/master/bin/ytdl.js#L181.
	};

	return new PProgress((resolve, reject, progress) => { // TODO: Check if I should use `p-lazy` to postpone the download to when `.then` is called.
		const download = ytdl(url, opts); // TODO: Add support for other formats, including music-only ones. Also, address the issue in https://github.com/fent/node-ytdl-core#handling-separate-streams.
		let totalSize;
		let downloadedSize = 0;

		download.on("response", res => {
			totalSize = parseFloat(res.headers["content-length"], 10);
		});

		download.on("data", data => {
			downloadedSize += data.length;
			const currentProgress = downloadedSize / totalSize;

			progress(currentProgress);
		});

		download.on("finish", resolve);
		download.on("error", reject);

		download.pipe(fs.createWriteStream(downloadPath)); // TODO: Check if I should leave this part to the user, instead of doing it in the module.
	});
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

	const videoInfo = urlParser.parse(url); // TODO: Maybe resolve the url before parsing it so that minified urls and such could be used.

	if (videoInfo.provider !== "youtube") {
		throw new Error(`Expected a video from Youtube, got video from ${videoInfo.provider}`);
	}

	if (videoInfo.mediaType !== "playlist" && videoInfo.mediaType !== "video") {
		throw new Error(`Expected a video url, got url to ${videoInfo.mediaType}`); // TODO: Throw error if the given `url` parameter is not an url using the `is-url-superb` package.
	}

	youtube = google.youtube({
		version: "v3",
		auth: apiKey
	});

	opts.max = Math.min(Math.max((opts.max || 5), 0), 50); // TODO: Maybe limit `opts.max` to be between 1 and 50 instead of 0 and 50 and `opts.start` to be between 0 and 49 instead of 0 and 50.
	opts.start = Math.min(Math.max((opts.start || 0), 0), 50);

	process.on("unhandledRejection", (reason, promise) => {
		if (reason.message.includes("The progress percentage can't be lower than the last progress event")) {
			promise.catch(() => Promise.resolve());
		}
	});

	return getUrlInfo(url, videoInfo, apiKey, opts)
		.then(res => {
			const downloads = [];

			for (const video of res) {
				const videoId = video.snippet.resourceId ? video.snippet.resourceId.videoId : video.id;
				const videoTitle = video.snippet.title;

				const ext = "mp4"; // TODO: Get this from the user instead of hardcoding it.

				const videoUrl = `https://youtu.be/${videoId}`;

				const videoPath = path.join(videosPath, `${videoTitle.replace(new RegExp(path.sep, "g"), "")}.${ext}`);  // TODO: Find a better solution than this one for https://github.com/itaisteinherz/videos/issues/1.

				const download = downloadVideo(videoUrl, ext, videoPath); // TODO: Add support for other formats, including music-only ones. Also, move to downloading videos synchronously rather than asynchronously.

				download.videoTitle = videoTitle;
				download.videoUrl = url;

				downloads.push(download);
			}

			return downloads;
		});
};
