//@ts-ignore
import removePunctuation from "remove-punctuation";
//@ts-ignore
import shoetest from "shoetest";

export const isAuthorEqual = (author: string, searchAuthor: string) => {
  const authorArray = author.split(" ");
  const matchedParts = authorArray.filter(part => searchAuthor.includes(part));

  console.log(authorArray, matchedParts);
  console.log(author, searchAuthor);

  if (author === searchAuthor) return true;
  if (authorArray.length === matchedParts.length) return true;

  return false;
};

export const isTitleEqual = (title: string, searchTitle: string) => {
  return title === searchTitle;
};

export const strip = (string: string) => {
  string = removePunctuation(string);
  string = shoetest.simplify(string);
  return string;
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
  titleSearch = `${titleSearch} (Unabridged)`;
  return authorSearch ? `${titleSearch} ${authorSearch}` : titleSearch;
};

//The Chosen Jerome Karabel
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
}

//test();
