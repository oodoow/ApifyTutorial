
## Tutorial II Apify SDK
Where and how can you use JQuery with the SDK?
You can use JQuery syntax in cheerio clawler, also in Puppeteers page.eval function if you first inject it into the page

What is the main difference between Cheerio and JQuery?
JQuery runs in the browser, so it can be used for dynamically created pages. Cheerio just parses source code of the page and then uses jquery syntax for selecting/manipulating DOM.

When would you use CheerioCrawler and what are its limitations?
CheerioClawler is useful for non dynamic pages. Pages that has not elements created by javascript. For javascript pages it does not work, because it just parse source code of page. Generally, if possible, it is better to use Cheerio, because of speed and hardware requirements.

What are the main classes for managing requests and when and why would you use one instead of another?
RequestQueue and RequestList. Generally RequestQueue is used, if dynamical adding requests is needed. Typically for scraping some eshop products, where we dont know or product links at the start. RequestList is used if we have constant array of urls that we want to process.

How can you extract data from a page in Puppeteer without using JQuery?
Without JQuery you can use document query selector. Functions like page.$ or page.$$

What is the default concurrency/parallelism the SDK uses?
By default clawlers are checking free cpu and memory and if available they increase concurrency up to 1000.

