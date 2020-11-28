
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
I think not, docker is started with some memory limit.

###### How can you run an actor with Puppeteer in a headful (non-headless) mode?
You must choose Node.js 12 + Chrome + Xvfb on Debian docker image. In local development you just add headless: false to the puppeteer launch method options.
###### Imagine the server/instance the container is running on has a 32 GB, 8-core CPU. What would be the most performant (speed/cost) memory allocation for CheerioCrawler? (Hint: NodeJS processes cannot use user-created threads)
Don't have a clue. 
###### What is the difference between RUN and CMD Dockerfile commands? 
CMD opposed to RUN does not do anything during docker build, but it sets the default command that will execute after the start of the container.

###### Does your Dockerfile need to contain a CMD command (assuming we don't want to use ENTRYPOINT which is similar)? If yes or no, why? 
Yes it does, docker is a container that run some command, without it, it is useless.

###### How does the FROM command work and which base images Apify provides?
FROM is for choosing predefined image, that we built our image on. Its optional, but will save a lot of work.
base images are> Node.js 12 on Alpine Linux - for basic tasks like cheerio crawling
                 Node.js 12 + Chrome on Debian - for pupeteer
                 Node.js 12 + Chrome + Xvfb on Debian - for pupeteer headful

## Tutorial IV Apify CLI & Source Code
###### Do you have to rebuild an actor each time the source code is changed?
Yes, actor must be rebuilded, you can set it up to do it automatically with github integration.
###### What is the difference between pushing your code changes and creating a pull request?
PR must be approved and merged, push just put your code changes to the repository.
###### How does the apify push command work? Is it worth using, in your opinion?
It uploads actor to the platform and builds it. 
## Tutorial V Tasks, Storage, API & Client
###### What is the relationship between actor and task?
Task is just setting of the actor. Task is running actor in some defined configuration like memory, input, timeout...
###### What are the differences between default (unnamed) and named storage? Which one would you choose for everyday usage? 
They are basicaly the same, the unnamed storage has some unique generated id, but the id for named storage is some "name" that you choose. Only real difference is, that named storages are kept on the platform indefinitely, unnamed are deleted 7 days after creation.
As for the question what to use, it depends. If everyday usage means scraping some data that are sent somewhere, it makes sense to use unnamed storage. If we want to save some historical data for each day ( like covid stats for example), then we use named storage.
###### What is the relationship between the Apify API and the Apify client? Are there any significant differences?
To use API it means to send requests, with Client you can use methods with parameters, which is easier. Also client repeats unsuccessful calls. 
###### Is it possible to use a request queue for deduplication of product IDs? If yes, how would you do that?
Yes, you must override uniqueKey property of Request by setting it to product ID value. Then each product Id will be in request queue only once.
###### What is data retention and how does it work for all types of storage (default and named)?
Data retention means how are data kept on platform.
Unnamed storages expire after 7 days unless otherwise specified.
Named storages are retained indefinitely.
###### How do you pass input when running an actor or task via the API?
You put it into the body of the request.

## Tutorial VI Apify Proxy & Bypassing Antiscraping Software
###### What types of proxies does the Apify Proxy include? What are the main differences between them?
Datacenter proxy - fast, cheap but can be easily ip blocked.
Residential proxy - computers of residents that are payed for running proxy, more expensive and slow but cannot be ip blocked (too many ips)
Google SERP proxy - used for scraping google search results localized by country and language

###### Which proxies (proxy groups) can users access with the Apify Proxy trial? How long does this trial last?
Looks like users can access datacenter and google serp proxies for 30 days.
###### How can you prevent a problem that one of the hardcoded proxy groups that a user is using stops working (a problem with a provider)? What should be the best practices?

###### Does it make sense to rotate proxies when you are logged in?
No, when logged in, you are acting as one user, so if you rotate proxy, it would be suspicious.
###### Construct a proxy URL that will select proxies only from the US (without specific groups).

###### What do you need to do to rotate proxies (one proxy usually has one IP)? How does this differ for Cheerio Scraper and Puppeteer Scraper?

###### Try to set up the Apify Proxy (using any group or auto) in your browser. This is useful for testing how websites behave with proxies from specific countries (although most are from the US). You can try Switchy Omega extension but there are many more. Were you successful?
###### Name a few different ways a website can prevent you from scraping it.
It can use captcha, it can embed information into media objects like images.
###### Do you know any software companies that develop anti-scraping solutions? Have you ever encountered them on a website?
No, I don't and didn't.


