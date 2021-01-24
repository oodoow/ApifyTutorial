
## Tutorial II Apify SDK
###### Where and how can you use JQuery with the SDK?
You can use JQuery syntax in cheerio crawler, also in Puppeteers page.eval function if you first inject it into the page
###### What is the main difference between Cheerio and JQuery?
JQuery runs in the browser, so it can be used for dynamically created pages. Cheerio just parses source code of the page and then uses jquery syntax for selecting/manipulating DOM.
###### When would you use CheerioCrawler and what are its limitations?
CheerioCrawler is useful for non dynamic pages. Pages that have not elements created by javascript. For javascript pages it does not work, because it just parse source code of page. Generally, if possible, it is better to use Cheerio, because of speed and hardware requirements.
###### What are the main classes for managing requests and when and why would you use one instead of another?
RequestQueue and RequestList. Generally RequestQueue is used, if dynamical adding requests is needed. Typically for scraping some eshop products, where we dont know all product links at the start. RequestList is used if we have constant array of urls that we want to process.
###### How can you extract data from a page in Puppeteer without using JQuery?
Without JQuery you can use document query selector. Functions like page.$ or page.$$
###### What is the default concurrency/parallelism the SDK uses?
By default crawlers are checking free cpu and memory and if available they increase concurrency up to 1000.

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
4GB - cheerio can run only on one core and one core can allocate 4GB
###### What is the difference between RUN and CMD Dockerfile commands? 
CMD opposed to RUN does not do anything during docker build, but it sets the default command that will execute after the start of the container.
###### Does your Dockerfile need to contain a CMD command (assuming we don't want to use ENTRYPOINT which is similar)? If yes or no, why? 
Yes it does, docker is a container that run some command, without it, it is useless.
###### How does the FROM command work and which base images Apify provides?
FROM is for choosing predefined image, that we built our image on. Its optional, but will save a lot of work.
base images are:
* Node.js 12 on Alpine Linux - for basic tasks like cheerio crawling
* Node.js 12 + Chrome on Debian - for pupeteer
* Node.js 12 + Chrome + Xvfb on Debian - for pupeteer headful

## Tutorial IV Apify CLI & Source Code
###### Do you have to rebuild an actor each time the source code is changed?
Yes, actor must be rebuilded, you can set it up to do it automatically with github integration.
###### What is the difference between pushing your code changes and creating a pull request?
PR must be approved and merged, push just put your code changes to the repository.
###### How does the apify push command work? Is it worth using, in your opinion?
It uploads actor to the platform and builds it. It can save some work, if you are developing actor locally and want to try how it behave on the platform.
## Tutorial V Tasks, Storage, API & Client
###### What is the relationship between actor and task?
Task is just setting of the actor. Task is running actor in some defined configuration like memory, input, timeout...
###### What are the differences between default (unnamed) and named storage? Which one would you choose for everyday usage? 
They are basicaly the same, the unnamed storage has some unique generated id, but the id for named storage is some "name" that you choose. Only real difference is, that named storages are kept on the platform indefinitely, unnamed are deleted 7 days after creation.
As for the question what to use, it depends. If everyday usage means scraping some data that are sent somewhere, it makes sense to use unnamed storage. If we want to save some historical data for each day, and maybe share it with rest of the world ( like covid stats for example), then we use named storage.
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
* Datacenter proxy - fast, cheap but can be easily ip blocked.
* Residential proxy - computers of residents that are payed for running proxy, more expensive and slow but cannot be ip blocked (too many ips)
* Google SERP proxy - used for scraping google search results localized by country and language
###### Which proxies (proxy groups) can users access with the Apify Proxy trial? How long does this trial last?
Looks like users can access datacenter and google serp proxies for 30 days.
###### How can you prevent a problem that one of the hardcoded proxy groups that a user is using stops working (a problem with a provider)? What should be the best practices?
If the proxy is hardcoded because program doesnt work with any other proxy group, then I think this has no solution. Otherwise should be better to specify larger set of proxy groups, for example, all proxies from some country. 
Other possibility is to use proxy group specified in enviroment variable, then user can choose what group to use.
###### Does it make sense to rotate proxies when you are logged in?
No, when logged in, you are acting as one user, so if you rotate proxy, it would be suspicious.
###### Construct a proxy URL that will select proxies only from the US (without specific groups).
http://country-US:APIFY_PROXY_PASSWORD@proxy.apify.com:8000
###### What do you need to do to rotate proxies (one proxy usually has one IP)? How does this differ for Cheerio Scraper and Puppeteer Scraper?
For simple request just use proxyUrl parameter, then each request use new proxy randomly selected from proxy pool.
Same with Cheerio Crawler by using proxyConfiguration paramater in Cheerio Crawler constructor.
With Puppeteer Crawler you need to restart browser to rotate proxy. You can use retireInstanceAfterRequestCount property to set number of request after which the proxy should be rotated or you can implement more intelligent way to retire browser after unsuccessful requests.
###### Try to set up the Apify Proxy (using any group or auto) in your browser. This is useful for testing how websites behave with proxies from specific countries (although most are from the US). You can try Switchy Omega extension but there are many more. Were you successful?
No, did not work. Also could not find any list of possible country codes.
###### Name a few different ways a website can prevent you from scraping it.
It can use captcha, it can embed information into media objects like images or it can just not response at all.
###### Do you know any software companies that develop anti-scraping solutions? Have you ever encountered them on a website?
No, I don't and didn't.

## Tutorial VII Actor Migrations & Maintaining State
###### Actors have a Restart on error option in their Settings. Would you use this for your regular actors? Why? When would you use it, and when not?
Generally no, it could lead to restarting loop because of the same error. Better to correct the error and then run it again. Restart on error could be used for actors, that run automatically without human supervision and it is essential for them to finish. Also it must be actors, that are reliable and a error happen only on rare ocassions and there is reason to believe that it was some random glitch and actor will succeed after restart.
###### Migrations happen randomly, but by setting Restart on error and then throwing an error in the main process, you can force a similar situation. Observe what happens. What changes and what stays the same in a restarted actor run?
Looks like, only thing that change is APIFY_FACT enviroment variable. :)
###### Why don't you usually need to add any special code to handle migrations in normal crawling/scraping? Is there a component that essentially solves this problem for you?
RequestQueue is persisted in KVS, so after migration we know which urls to scrape and which are already done.
###### How can you intercept the migration event? How much time do you need after this takes place and before the actor migrates?
You can listen for migrating event or check persistState event's isMigrating property.  
###### When would you persist data to a default key-value store and when would you use a named key-value store?
If we want to access data from the outside, it is better for KVS to have some normal name. Also named KVS is not deleted after some time.

###### Elaborate if you can ensure this object will stay 100% accurate, which means it will reflect the data in the dataset. Is this possible? If so, how?
I dont know how to ensure 100% accuracy. If actor migrate or throw error just after updating the dataset and before updating and persisting the object, then object and data in the dataset will differ. Also that would mean, that the url will be processed again, and there will be a duplicate in the dataset. (that could be removed by deduplication actor) Maybe this could be solved by implementing transactions like in database. 
Other than this rare occassion, object should remain accurate, its persisting every time persist state event launch, so every 60 seconds and when migrating, it is also persisting after each change in the dataset and before actor finish.
