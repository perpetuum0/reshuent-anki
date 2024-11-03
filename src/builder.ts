import * as fs from "fs";
import archiver from "archiver";
import { AnkiCard, AnkiNote, Question, QuestionFields } from "./types";
import { Database } from "sqlite3";
import { open } from "sqlite";
import { hashToInteger } from "./utils";

function copyBaseDb() {
	fs.cpSync("./base", "./out/deck", { recursive: true });

	return open({
		filename: "./out/deck/collection.anki21",
		driver: Database,
	});
}

export async function buildDeck(
	deckName: string,
	noteTypeName: string,
	questions: Question[]
) {
	// Get a copy of baseDb
	const db = await copyBaseDb();

	const query = await db.get(`
				SELECT models, decks
				FROM col;
				`);

	let decks = JSON.parse(query.decks || "");
	let models = JSON.parse(query.models || "");

	// Rename the deck
	decks[Object.keys(decks)[0]]["name"] = deckName;

	// Get note type mid
	let mid: number = Number(Object.keys(models)[0]);

	// Rename note type
	models[mid]["name"] = noteTypeName;

	// Update the collection
	await db.run(`UPDATE col SET decks = ?, models = ?`, [
		JSON.stringify(decks),
		JSON.stringify(models),
	]);

	// Start adding questions
	let creationTimestamp = Date.now();
	for (const q of questions) {
		creationTimestamp += 1;
		const creationTimestampSeconds = Math.round(creationTimestamp / 1000);

		// Join question fields
		let flds = "";
		for (const field of QuestionFields) {
			flds += q[field] + String.fromCharCode(31);
		}
		flds = flds.slice(0, flds.length - String.fromCharCode(31).length);

		// Create a new note
		let note: AnkiNote = {
			id: creationTimestamp,
			guid: q.id + (q.type ? "_" + q.type : ""),
			mid,
			mod: creationTimestampSeconds,
			usn: -1,
			tags: "",
			flds,
			sfld: Number(q.id),
			csum: hashToInteger(q.id),
			flags: 0,
			data: "",
		};

		// Create a new card
		let card: AnkiCard = {
			id: creationTimestamp, // the epoch milliseconds of when the card was created
			nid: note.id, // notes.id
			did: 1730616639389, // deck id (available in col table)
			ord: 0, // ordinal : identifies which of the card templates or cloze deletions it corresponds to
			mod: creationTimestampSeconds, // modification time as epoch seconds
			usn: -1, // update sequence number : used to figure out diffs when syncing.
			type: 0, // 0=new, 1=learning, 2=review, 3=relearning
			queue: 0,
			due: 2,
			ivl: 0,
			factor: 0,
			reps: 0,
			lapses: 0,
			left: 0,
			odue: 0,
			odid: 0,
			flags: 0,
			data: "{}",
		};

		// Insert rows in db
		await db.run(
			`
		    		INSERT INTO notes (id, guid, mid, mod, usn, tags, flds, sfld, csum, flags, data)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
					`,
			[
				note.id,
				note.guid,
				note.mid,
				note.mod,
				note.usn,
				note.tags,
				note.flds,
				note.sfld,
				note.csum,
				note.flags,
				note.data,
			]
		);

		await db.run(
			`
		    		INSERT INTO cards (id, nid, did, ord, mod, usn, type, queue, due, ivl, factor, reps, lapses, left, odue, odid, flags, data)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
					`,
			[
				card.id,
				card.nid,
				card.did,
				card.ord,
				card.mod,
				card.usn,
				card.type,
				card.queue,
				card.due,
				card.ivl,
				card.factor,
				card.reps,
				card.lapses,
				card.left,
				card.odue,
				card.odid,
				card.flags,
				card.data,
			]
		);
	}

	// Close connection with db and save the .apkg
	await db.close();
	writeApkg();
}

function writeApkg() {
	const output = fs.createWriteStream("./out/deck.apkg");
	const archive = archiver("zip", {
		zlib: { level: 9 },
	});

	output.on("close", function () {
		console.log(archive.pointer() + " total bytes");
		console.log(
			"archiver has been finalized and the output file descriptor has closed."
		);
	});

	output.on("end", function () {
		console.log("Data has been drained");
	});

	archive.on("warning", function (err) {
		if (err.code === "ENOENT") {
			// log warning
		} else {
			// throw error
			throw err;
		}
	});

	archive.on("error", function (err) {
		throw err;
	});

	archive.pipe(output);

	archive.directory("out/deck", false);

	archive.finalize();
}
