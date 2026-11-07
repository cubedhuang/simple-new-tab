export type Quote = {
	content: string;
	author: string;
	link: string;
	tags: string[];
};

let quotes: Promise<Quote[]> | undefined;

export function loadQuotes() {
	return (quotes ??= fetch('/quotes.json').then(res => res.json()));
}

/** Falls back to every quote when no tags are selected or none of them match. */
export function filterQuotes(quotes: Quote[], selectedTags: string[]) {
	const matching = quotes.filter(({ tags }) =>
		tags.some(tag => selectedTags.includes(tag))
	);

	return matching.length > 0 ? matching : quotes;
}
