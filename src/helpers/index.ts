// @ts-ignore
import removePunctuation from "remove-punctuation";
// @ts-ignore
import shoetest from "shoetest";
// @ts-ignore
import replaceAll from "replaceall";

export const isAuthorEqual = (author: string, searchAuthor: string) => {
  const authorArray = author.split(" ");
  const matchedParts = authorArray.filter(part => searchAuthor.includes(part));

  if (author === searchAuthor) return true;
  if (authorArray.length === matchedParts.length) return true;

  return false;
};

export const isTitleEqual = (title: string, searchTitle: string) => {
  return title === searchTitle;
};

export const strip = (search = "") => {
  search = search.replace(/ *\([^)]*\) */g, ""); // remove text inside parentheses
  search = removePunctuation(search);
  search = search.toLowerCase();
  search = replaceAll("Unabridged", "", search);
  search = replaceAll("Abridged", "", search);
  search = replaceAll("The", "", search);
  search = replaceAll("-", " ", search); // short dash
  search = replaceAll("—", " ", search); // long dash
  search = shoetest.simplify(search) || "";
  return search.trim();
};

export const isExactMatch = (
  titleSearch: string,
  title: string,
  author: string,
  authorSearch: string
) => {
  titleSearch = strip(titleSearch);
  title = strip(title);
  author = strip(author);
  authorSearch = strip(authorSearch);

  const authorEqual = isAuthorEqual(author, authorSearch);
  const titleEqual = isTitleEqual(title, titleSearch);

  if (titleEqual && !authorSearch) return true;
  if (titleEqual && authorEqual) return true;

  return false;
};

export const createSearchQuery = (
  titleSearch: string,
  authorSearch: string
) => {
  titleSearch = `${strip(titleSearch)} (Unabridged)`;
  const searchQuery = authorSearch
    ? `${titleSearch} ${authorSearch}`
    : titleSearch;
  if (!searchQuery) throw new Error("no search query created");
  return searchQuery;
};

function test() {
  let title = "The Chosen";
  let searchTitle = "The Chosen";
  let author = "Karabel, Jerome";
  let searchAuthor = "Jerome Karabel";

  console.log(isExactMatch(searchTitle, title, author, searchAuthor));

  title = "Harry Potter";
  searchTitle = "Harry Potter";
  author = "Rowling, JK";
  searchAuthor = "J.K. Rowling";

  console.log(isExactMatch(searchTitle, title, author, searchAuthor));

  title = "Frankenstein (Unabridged)";
  searchTitle = "Frankenstein";
  author = "Shelley, Mary";
  searchAuthor = "Mary Shelley";

  console.log(isExactMatch(searchTitle, title, author, searchAuthor));

  title = "The Count of Monte Cristo (Abridged)";
  searchTitle = "The Count of Monte-Cristo";
  author = "Dumas, Alexandre";
  searchAuthor = "Alexandre Dumas";

  console.log(isExactMatch(searchTitle, title, author, searchAuthor));

  title = "Moby-Dick, or, The Whale";
  searchTitle = "Moby-Dick, Or The Whale (Unabridged)";
  author = "Melville, Herman";
  searchAuthor = "Herman Melville";

  console.log(isExactMatch(searchTitle, title, author, searchAuthor));
}
test();
