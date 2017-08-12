"use strict";
const fs = require("fs");
const path = require("path");

const pify = require("pify");
const google = require("googleapis");
const urlParser = require("js-video-url-parser");
const ytdl = require("ytdl-core");
const ProgressBar = require("progress");
const chalk = require("chalk");

let youtube;

function downloadVideo(url, ext) {
	const opts = {
		filter: format => format.bitrate && format.container === ext // NOTE: This was taken from https://github.com/fent/node-ytdl/blob/master/bin/ytdl.js#L248.
	};

	return ytdl(url, opts);
}

function showDownloadInfo(download, videoTitle, videoUrl) {
	let bar;

	download.on("response", res => {
		bar = new ProgressBar(`Downloading ${chalk.blue(videoTitle)} [:bar] :percent `, {
			complete: String.fromCharCode(0x2588),
			total: parseInt(res.headers["content-length"], 10)
		});
	});

	download.on("data", data => {
		bar.tick(data.length);
	});

	download.on("finish", () => {
		console.log(`Finished downloading ${chalk.blue(videoTitle)} (${chalk.underline(videoUrl)})`);
	});

	return new Promise((resolve, reject) => {
		download.on("finish", resolve);
		download.on("error", reject);
	});
}

module.exports = (url, apiKey, videosPath, opts) => {
	if (typeof url !== "string") {
		throw new TypeError(`Expected a string, got ${typeof url}`);
	}

	if (typeof apiKey !== "string") {
		throw new TypeError(`Expected a string, got ${typeof apiKey}`);
	}

	if (typeof videosPath !== "string") {
		throw new TypeError(`Expected a string, got ${typeof videosPath}`);
	}

	const videoInfo = urlParser.parse(url);

	if (videoInfo.provider !== "youtube") {
		throw new Error(`Expected a video from Youtube, got video from ${videoInfo.provider}`);
	}

	if (["playlist", "video"].indexOf(videoInfo.mediaType) === -1) {
		throw new Error(`Expected a video url, got url to ${videoInfo.mediaType}`);
	}

	opts = opts || {};

	youtube = google.youtube({
		version: "v3",
		auth: apiKey
	});

	const isPlaylist = typeof videoInfo.list !== "undefined" || videoInfo.mediaType === "playlist";

	if (!isPlaylist) {
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

				const download = downloadVideo(url, ext); // TODO: Add support for other formats, including music-only ones.

				download.pipe(fs.createWriteStream(videoPath));

				return showDownloadInfo(download, videoTitle, url);
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

				// const videoUrl = `youtube.com/watch?v=${videoId}`;
				const videoUrl = urlParser.create({
					videoInfo: {
						provider: "youtube",
						id: videoId,
						mediaType: "video"
					},
					format: "short"
				});
				const videoPath = path.join(videosPath, `${videoTitle}.${ext}`);

				const download = downloadVideo(videoUrl, ext); // TODO: Add support for other formats, including music-only ones. Also, move to downloading videos synchronously rather than asynchronously.

				downloads.push(showDownloadInfo(download, videoTitle, videoUrl));

				download.pipe(fs.createWriteStream(videoPath));
			}

			return Promise.all(downloads);
		});
};
