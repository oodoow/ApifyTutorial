
## Tutorial II Apify SDK
###### Where and how can you use JQuery with the SDK?
You can use JQuery syntax in cheerio clawler, also in Puppeteers page.eval function if you first inject it into the page

###### What is the main difference between Cheerio and JQuery?
JQuery runs in the browser, so it can be used for dynamically created pages. Cheerio just parses source code of the page and then uses jquery syntax for selecting/manipulating DOM.

###### When would you use CheerioCrawler and what are its limitations?
CheerioClawler is useful for non dynamic pages. Pages that has not elements created by javascript. For javascript pages it does not work, because it just parse source code of page. Generally, if possible, it is better to use Cheerio, because of speed and hardware requirements.

###### What are the main classes for managing requests and when and why would you use one instead of another?
RequestQueue and RequestList. Generally RequestQueue is used, if dynamical adding requests is needed. Typically for scraping some eshop products, where we dont know or product links at the start. RequestList is used if we have constant array of urls that we want to process.

###### How can you extract data from a page in Puppeteer without using JQuery?
Without JQuery you can use document query selector. Functions like page.$ or page.$$

###### What is the default concurrency/parallelism the SDK uses?
By default clawlers are checking free cpu and memory and if available they increase concurrency up to 1000.


## Tutorial III Apify Actors & Webhooks

###### How do you allocate more CPU for your actor run?
You can set it up on the platform or specify it in the options in Apify.call method
###### How can you get the exact time when the actor was started from within the running actor process?
It's in enviroment variable APIFY_STARTED_AT
###### Which are the default storages an actor run is allocated (connected to)?
Each actor run has its own associated default Key-value-store, Dataset and Request queue
###### Can you change the memory allocated to a running actor?

###### How can you run an actor with Puppeteer in a headful (non-headless) mode?
You must choose Node.js 12 + Chrome + Xvfb on Debian docker image. In local development you just add headless: false to the puppeteer launch method options.
###### Imagine the server/instance the container is running on has a 32 GB, 8-core CPU. What would be the most performant (speed/cost) memory allocation for CheerioCrawler? (Hint: NodeJS processes cannot use user-created threads)
Don't have a clue.
###### What is the difference between RUN and CMD Dockerfile commands?
###### Does your Dockerfile need to contain a CMD command (assuming we don't want to use ENTRYPOINT which is similar)? If yes or no, why?
###### How does the FROM command work and which base images Apify provides?
base images are> Node.js 12 on Alpine Linux - for basic tasks like cheerio crawling
                 Node.js 12 + Chrome on Debian - for pupeteer
                 Node.js 12 + Chrome + Xvfb on Debian - for pupeteer headful
