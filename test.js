import fs from "fs";
import path from "path";

import test from "ava";
import pify from "pify";
import rimraf from "rimraf";
import m from ".";

const tempPath = path.join(__dirname, "temp");

const apiKey = process.env.YOUTUBE_API_KEY;

async function macro(t, url, filenames, opts) {
	await m(url, apiKey, tempPath, opts).then(downloads => Promise.all(downloads));

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

test.serial("download playlist from video", macro, "https://www.youtube.com/watch?v=q6EoRBvdVPQ&index=1&list=PLOy0j9AvlVZPto6IkjKfpu0Scx--7PGTC", ["Yee.mp4"], {max: 1});

test.serial("download playlist from page", macro, "https://www.youtube.com/playlist?list=PLOy0j9AvlVZPto6IkjKfpu0Scx--7PGTC", ["Yee.mp4"], {max: 1});

test.serial("start downloading playlist at given index", macro, "https://www.youtube.com/playlist?list=PLOy0j9AvlVZPto6IkjKfpu0Scx--7PGTC", ["color red.mp4"], {start: 1, max: 1});

test.serial("start + max > 50", macro, "https://www.youtube.com/playlist?list=PLOy0j9AvlVZPto6IkjKfpu0Scx--7PGTC", ["Nicolas Cage Driving.mp4", "thomas kinkade PREVIEW.MOV.mp4"], {start: 48});
