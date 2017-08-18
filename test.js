import fs from "fs";
import path from "path";

import test from "ava";
import pify from "pify";
import pEvent from "p-event";
import rimraf from "rimraf";
import arrify from "arrify";
import m from ".";

const tempPath = path.join(__dirname, "temp");

const apiKey = "AIzaSyD6AnKxqPrNd7M_nVS5EkQ2TFS0uvWphNo"; // TODO: Move this into an environment variable.

async function macro(t, url, filenames, opts) {
	const download = await m(url, apiKey, tempPath, opts);

	await pEvent(arrify(download)[0].downloadStream, "finish");

	const files = await pify(fs.readdir)(tempPath);
	t.deepEqual(files, filenames);

	const stats = await pify(fs.stat)(path.join(tempPath, filenames[0]));

	t.true(stats.isFile());
	t.true(stats.size > 0);
}

test.beforeEach(async () => {
	await pify(fs.mkdir)(tempPath);
});

test.afterEach.always(async () => {
	await pify(rimraf)("temp");
});

test.serial("throw if url is not a string", t => {
	t.throws(() => m(5, "", ""), "Expected `url` to be a `string`, got `number`");
	t.throws(() => m(true, "", ""), "Expected `url` to be a `string`, got `boolean`");
});

test.serial("throw if apiKey is not a string", t => {
	t.throws(() => m("", 5, ""), "Expected `apiKey` to be a `string`, got `number`");
	t.throws(() => m("", true, ""), "Expected `apiKey` to be a `string`, got `boolean`");
});

test.serial("throw if videosPath is not a string", t => {
	t.throws(() => m("", "", 5), "Expected `videosPath` to be a `string`, got `number`");
	t.throws(() => m("", "", true), "Expected `videosPath` to be a `string`, got `boolean`");
});

test.serial("download video", macro, "https://youtu.be/q6EoRBvdVPQ", ["Yee.mp4"]);

test.serial("download playlist from video", macro, "https://youtu.be/q6EoRBvdVPQ?list=PL7XlqX4npddfrdpMCxBnNZXg2GFll7t5y", ["Yee.mp4"], {max: 1});

test.serial("download playlist from page", macro, "https://www.youtube.com/playlist?list=PL7XlqX4npddfrdpMCxBnNZXg2GFll7t5y", ["Yee.mp4"], {max: 1});
