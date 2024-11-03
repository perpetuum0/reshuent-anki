// Question fields are in a strict order
export const QuestionFields = [
	"id",
	"text",
	"answer",
	"choices",
	"explanation",
	"type",
	"source",
] as const;

export type Question = {
	[field in (typeof QuestionFields)[number]]: string;
};

export type ParsedData = {
	title: string;
	variant: string;
	questions: Question[];
};

/*
 	INFO: Some properties below are hard typed, because they are unused when creating new objects.
	Database schema descriptions are taken from https://github.com/ankidroid/Anki-Android/wiki/Database-Structure
*/
export type AnkiNote = {
	id: EpochTimeStamp; // epoch milliseconds of when the note was created
	guid: string; // globally unique id, almost certainly used for syncing
	mid: number; // model id
	mod: EpochTimeStamp; // modification timestamp, epoch seconds
	usn: -1; // update sequence number: for finding diffs when syncing.
	tags: ""; // space-separated string of tags. includes space at the beginning and end, for LIKE "% tag %" queries
	flds: string; // the values of the fields in this note. separated by 0x1f (31) character.
	sfld: number; // sort field: used for quick sorting and duplicate check. The sort field is an integer so that when users are sorting on a field that contains only numbers, they are sorted in numeric instead of lexical order. Text is stored in this integer field.
	csum: number; //field checksum used for duplicate check. integer representation of first 8 digits of sha1 hash of the first field
	flags: 0; // unused
	data: ""; // unused
};

export type AnkiCard = {
	id: EpochTimeStamp; // the epoch milliseconds of when the card was created
	nid: AnkiNote["id"]; // notes.id
	did: 1730616639389; // deck id (available in col table)
	ord: 0; // ordinal : identifies which of the card templates or cloze deletions it corresponds to
	mod: EpochTimeStamp; // modification time as epoch seconds
	usn: -1; // update sequence number : used to figure out diffs when syncing.
	type: 0; // 0=new, 1=learning, 2=review, 3=relearning
	queue: 0;
	due: 2;
	ivl: 0;
	factor: 0;
	reps: 0;
	lapses: 0;
	left: 0;
	odue: 0;
	odid: 0;
	flags: 0;
	data: "{}";
};
