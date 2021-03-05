import puppeteer, { Page, Browser } from "puppeteer";
import { parse as HTMLParser } from "node-html-parser";
import os from "os";
import { ARResult } from "./interfaces";
import { isExactMatch, createSearchQuery } from "../helpers/index";
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

// puppetter vars
let BROWSER: Browser | null = null;

const createBrowser = async () => {
  // ONLY RUN SPECIAL EXECUTABLE ON RASPBERRY PI
  const options =
    os.platform() !== "darwin"
      ? {
          headless: true,
          executablePath: "/usr/bin/chromium-browser",
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        }
      : {};

  console.time("create browser");
  BROWSER = await puppeteer.launch(options);
  console.timeEnd("create browser");
};

const createPage = async () => {
  if (!BROWSER) await createBrowser();

  console.time("create page");
  const page = await BROWSER.newPage();
  console.timeEnd("create page");
  return page;
};

const goToSearchPage = async (page: Page) => {
  console.time("go to page");
  await page.goto(AR_WEBSITE_URL, {
    waitUntil: "networkidle0",
  });

  // handle cookie page
  if (page.url().includes("UserType.aspx")) {
    await page.evaluate(() => {
      (document.getElementById("radTeacher") as any).checked = true;
    });
    await page.click("#btnSubmitUserType");
  }
  console.timeEnd("go to page");
  return page;
};

const performSearch = async (page: Page, search: string) => {
  console.time("performSearch");
  await page.waitForSelector(QUERY_PARAMETERS.searchBarId);
  await page.waitForSelector(QUERY_PARAMETERS.searchBtnId);
  await page.type(QUERY_PARAMETERS.searchBarId, search);
  await page.click(QUERY_PARAMETERS.searchBtnId);
  await page.waitForNavigation({ waitUntil: "networkidle0" });
  console.timeEnd("performSearch");
  return page;
};

async function clickOnResult(page: Page) {
  console.time("clickOnResult");
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
  console.timeEnd("clickOnResult");
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

const closePage = async (page: Page) => {
  console.time("close page");
  await page.close();
  console.timeEnd("close page");
};

export const closeBrowser = async () => {
  BROWSER && (await BROWSER.close());
};

export const getARscore = async (
  titleSearch: string,
  authorSearch?: string
) => {
  try {
    const date = new Date().toString();
    // console.time(`started search ${titleSearch} ${date}`);
    const search = createSearchQuery(titleSearch, authorSearch);
    let page = await createPage();
    page = await goToSearchPage(page);
    page = await performSearch(page, search);
    page = await clickOnResult(page);
    const results = await parseResults(page, titleSearch, authorSearch);
    // console.timeEnd(`started search ${titleSearch} ${date}`);
    closePage(page);
    return { ...results } as ARResult;
  } catch ({ message }) {
    // closeBrowser();
    return { error: message } as any;
  }
};

export default getARscore;

(async () => {
  createBrowser();
})();
