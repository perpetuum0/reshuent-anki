import crypto from "crypto";

// hashToInteger is used in AnkiNote.csum
export function hashToInteger(val: string) {
	const hash = crypto.createHash("sha1").update(val).digest("hex");

	// Get the first 8 characters of the hash and convert it to an integer
	const hashInt = parseInt(hash.slice(0, 8), 16);

	return hashInt;
}
