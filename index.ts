import { parseDom } from "./src/parsers/reshuent-parser";
import { ParsedData } from "./src/types";
import { buildDeck } from "./src/builder";
import reader from "readline-sync";

/*
	Below is a simple example of using deck builder with the built-in reshuent.kz parser
*/
void (async () => {
	let url = "";
	do {
		const urlInput = reader.question("Введите URL варианта: ");

		// A simple check if a reshuent.kz page is valid
		if (!urlInput.includes("test?id=")) console.log("Неверный URL");
		else url = urlInput;
	} while (!url);

	// Set a printable version if not specified
	if (!url.includes("&print=true")) url += "&print=true";

	// Parse data using a built-in parser
	let parsedData: ParsedData = await parseDom(url);

	// Use parsed data to build a deck
	buildDeck(
		`${parsedData.title} ${parsedData.variant}`,
		`Вопросы ${parsedData.title.slice(5)}`,
		parsedData.questions
	);
})();
