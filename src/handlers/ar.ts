import puppeteer, { Page } from "puppeteer";
import { parse as HTMLParser } from "node-html-parser";
import { ARResult } from "./interfaces";

const AR_WEBSITE_URL = "https://www.arbookfind.com/";

const QUERY_PARAMETERS = {
  points: "#ctl00_ContentPlaceHolder1_ucBookDetail_lblPoints",
  level: "#ctl00_ContentPlaceHolder1_ucBookDetail_lblBookLevel",
  interest: "#ctl00_ContentPlaceHolder1_ucBookDetail_lblInterestLevel",
  title: "#ctl00_ContentPlaceHolder1_ucBookDetail_lblBookTitle",
  isbn: "#ctl00_ContentPlaceHolder1_ucBookDetail_tblPublisherTable tr",
  author: "#ctl00_ContentPlaceHolder1_ucBookDetail_lblAuthor",
  wordCount: "#ctl00_ContentPlaceHolder1_ucBookDetail_lblWordCount",
  searchBarId: "#ctl00_ContentPlaceHolder1_txtKeyWords",
  searchBtnId: "#ctl00_ContentPlaceHolder1_btnDoIt",
};

const isExactMatch = (
  titleSearch: string,
  title: string,
  author: string,
  authorSearch: string
) => {
  if (titleSearch === title && !authorSearch) return true;
  if (titleSearch === title && author === authorSearch) return true;
  if (titleSearch === title && author.includes(authorSearch)) return true;
  if (title.includes(titleSearch) && author.includes(authorSearch)) return true;
  return false;
};

const goToSearchPage = async (page: Page) => {
  await page.goto(AR_WEBSITE_URL, {
    waitUntil: "networkidle0",
  });
  await page.evaluate(() => {
    (document.getElementById("radTeacher") as any).checked = true;
  });
  await page.click("#btnSubmitUserType");
  return page;
};

const performSearch = async (page: Page, search: string) => {
  await page.waitForSelector(QUERY_PARAMETERS.searchBarId);
  await page.waitForSelector(QUERY_PARAMETERS.searchBtnId);
  await page.type(QUERY_PARAMETERS.searchBarId, search);
  await page.click(QUERY_PARAMETERS.searchBtnId);
  await page.waitForNavigation({ waitUntil: "networkidle0" });
  return page;
};

async function clickOnResult(page: Page) {
  const resultSelector = ".book-result a";
  await page
    .waitForSelector(resultSelector, {
      timeout: 5000,
    })
    .catch(() => {
      throw new Error("no results");
    });

  await page.click(resultSelector);
  await page.waitForNavigation({ waitUntil: "networkidle0" });
  return page;
}

const parseISBNTable = async (page: Page) => {
  const nodeList = await page.$$eval(QUERY_PARAMETERS.isbn, rowArray =>
    rowArray.map(row => row.outerHTML)
  );

  const returnArray = [];

  // ignore header
  for (let index = 1; index < nodeList.length; index++) {
    const element = nodeList[index];
    const HTMLElement = HTMLParser(element);
    const TDArray = HTMLElement.querySelectorAll("td");
    const data = {
      publisher: TDArray[0].innerText,
      isbn: TDArray[2].innerText,
      yearPublished: TDArray[3].innerText,
      pageCount: TDArray[4].innerText,
    };
    returnArray.push(data);
  }

  return returnArray;
};

const parseResults = async (
  page: Page,
  titleSearch: string,
  authorSearch: string
) => {
  const getInnerText = (el: HTMLElement) => el.innerText;
  const points = await page.$eval(QUERY_PARAMETERS.points, getInnerText);
  const level = await page.$eval(QUERY_PARAMETERS.level, getInnerText);
  const interestLevel = await page.$eval(
    QUERY_PARAMETERS.interest,
    getInnerText
  );
  const title = await page.$eval(QUERY_PARAMETERS.title, getInnerText);
  const author = await page.$eval(QUERY_PARAMETERS.author, getInnerText);
  const isbn = await parseISBNTable(page);

  return {
    points,
    level,
    interestLevel,
    author,
    title,
    isbn,
    isExactMatch: isExactMatch(titleSearch, title, author, authorSearch),
    searchQuery: createSearchQuery(titleSearch, authorSearch),
  };
};

const createSearchQuery = (titleSearch: string, authorSearch: string) => {
  return authorSearch ? `${titleSearch} ${authorSearch}` : titleSearch;
};

export const getARscore = async (
  titleSearch: string,
  authorSearch?: string
) => {
  const browser = await puppeteer.launch();
  try {
    const search = createSearchQuery(titleSearch, authorSearch);
    let page = await browser.newPage();
    page = await goToSearchPage(page);
    page = await performSearch(page, search);
    page = await clickOnResult(page);
    const results = await parseResults(page, titleSearch, authorSearch);
    await browser.close();
    return { ...results } as ARResult;
  } catch ({ message }) {
    await browser.close();
    return { error: message } as any;
  }
};

export default getARscore;

async function test() {
  let result = await getARscore("East of Eden", "Steinbeck");
  result && console.log(result.hasResults, result.title, result.points);

  result = await getARscore("East of Eden");
  result && console.log(result.hasResults, result.title, result.points);

  result = await getARscore("").catch(err => err);
  result && console.log(result.hasResults, result.title, result.points);

  result = await getARscore("Oliver Twist", "Dickens");
  result && console.log(result.hasResults, result.title, result.points);

  result = await getARscore("Oliver Twist", "Dickens, Charles");
  result && console.log(result.hasResults, result.title, result.points);
}

// test();
