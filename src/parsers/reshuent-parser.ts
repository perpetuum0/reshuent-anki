import { JSDOM } from "jsdom";
import { ParsedData, Question } from "../types";

async function fetchDom(url: string): Promise<JSDOM | undefined> {
	try {
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`Failed to fetch: ${response.statusText}`);
		}

		const html = await response.text();

		return new JSDOM(html);
	} catch (error) {
		console.error(`Error fetching DOM: ${(error as Error).message}`);
	}
}

export async function parseDom(url: string): Promise<ParsedData> {
	const result: ParsedData = {
		title: "",
		variant: "",
		questions: [],
	};

	// Fetch URL's DOM
	console.log("Fetching URL...");
	const dom = await fetchDom(url).then(jsdom => jsdom?.window.document);

	if (dom) console.log("URL fetched successfully.");
	else throw new Error("Failed fetching DOM");

	// Parse title & variant
	result.title =
		dom.querySelector("body > div:nth-child(2) > div:nth-child(2)")?.textContent ||
		"";
	result.variant =
		(dom
			.querySelector("body > div:nth-child(2) > div:nth-child(3)")
			?.textContent?.match(/[0-9]+/) || [])[0] || "";

	// Parse questions
	const questionDivs = Array.from(dom.getElementsByClassName("prob_maindiv"));
	for (const qDiv of questionDivs) {
		const question: Question = {
			id: "",
			text: "",
			answer: "",
			choices: "",
			explanation: "",
			type: "",
			source: "",
		};

		// Required fields
		question.id = qDiv.querySelector(".prob_nums a")?.textContent || "";

		question.answer = qDiv.querySelector(".answer span")?.textContent?.slice(7) || "";

		const choices: string[] = [];
		for (const choiceElement of qDiv.querySelectorAll(".answers div")) {
			if (choiceElement.textContent) choices.push(choiceElement.textContent);
		}
		question.choices = choices.join("<br>");

		const texts: string[] = [];
		for (const qp of qDiv.querySelectorAll(".pbody p")) {
			if (qp.textContent) texts.push(qp.textContent);
		}
		question.text = texts.join("<br>");

		// Optional fields
		question.type =
			(qDiv.querySelector(".prob_nums")?.textContent?.match(/[0-9]+/) || [])[0] ||
			"";

		question.explanation =
			qDiv.querySelector(".solution p b")?.parentElement?.textContent?.slice(14) ||
			"";

		question.source =
			qDiv.querySelector("div .attr4 span")?.textContent?.slice(10) || "";

		// Push to result.questions
		if (!question.id || !question.text || !question.answer || !question.choices)
			console.log("Missing required fields on question #" + question.id);
		else result.questions.push(question as Question);
	}

	return result;
}
