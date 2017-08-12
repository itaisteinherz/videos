import fs from "fs";
import path from "path";

import test from "ava";
import pify from "pify";
import rimraf from "rimraf";
import m from ".";

const tempPath = path.join(__dirname, "temp");

const apiKey = "AIzaSyD6AnKxqPrNd7M_nVS5EkQ2TFS0uvWphNo";

test.beforeEach(async () => {
	await pify(fs.mkdir)(tempPath);
});

test.afterEach(async () => {
	await pify(rimraf)("temp");
});

test.serial("download video", async t => {
	const videoUrl = "https://youtu.be/q6EoRBvdVPQ";

	const filename = "Yee.mp4";

	await m(videoUrl, apiKey, tempPath);

	const files = await pify(fs.readdir)(tempPath);
	t.is(files[0], filename);

	const fileStats = await pify(fs.stat)(path.join(tempPath, filename));
	t.true(fileStats.isFile());
	t.true(fileStats.size > 0);
});

test.serial("download playlist", async t => {
	const playlistUrl = "https://youtu.be/q6EoRBvdVPQ?list=PL7XlqX4npddfrdpMCxBnNZXg2GFll7t5y";

	const filenames = ["Yee.mp4"];

	await m(playlistUrl, apiKey, tempPath, {max: 1});

	const files = await pify(fs.readdir)(tempPath);
	t.deepEqual(files, filenames);

	const filesStats = [];

	for (const filename of filenames) {
		filesStats.push(pify(fs.stat)(path.join(tempPath, filename)));
	}

	const stats = await Promise.all(filesStats);
	t.true(stats[0].isFile());
	t.true(stats[0].size > 0);
});
