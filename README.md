# reshuent-anki

A simple script to import questions from `reshuent.kz` into an Anki deck.

## Usage

To use this script, simply compile & run it:

```bash
tsc && node dist/
```

Then follow instructions in the cli.

The deck can then be found at `out/deck.apkg`.

## Using custom question sources

You can import questions from other sources.

To build a deck from custom data, call the `buildDeck()` function:

```typescript
async function buildDeck(
	deckName: string,
	noteTypeName: string,
	questions: Question[] // See below
);
```

This function will output your deck to `out/`

#### `buildDeck() questions: Question[]`

`Question` is a string object with following properties:

```typescript
type Question = {
	id: string;
	text: string;
	answer: string;
	choices: string;
	explanation: string; // may be empty
	type: string; // may be empty
	source: string; // may be empty
};
```
