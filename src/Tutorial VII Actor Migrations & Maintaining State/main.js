/** 
 * This template is a production ready boilerplate for developing with `CheerioCrawler`.
 * Use this to bootstrap your projects using the most up-to-date code.
 * If you're looking for examples or want to learn more, see README.
 */

const Apify = require('apify'); 
const { handleStart, handleNextURL, handleDetail } = require('./routes');
const { utils: { log } } = Apify;

const KVSAsinCountKey = 'asinCount'
const logInterval = 20000;





Apify.main(async () =>
{
    let INPUT = await Apify.getInput();

    if (!INPUT || !INPUT.keyword)
    {
        log.info("No input, default keyword: samsung'")
        INPUT = {
            "keyword": "samsung"
        }
    }

    const asinObject = await Apify.getValue(KVSAsinCountKey) || {};
    const logObject = () =>
    {
        log.info(new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }), asinObject || 'empty');
    };
    const persistObject = () => await Apify.setValue(KVSAsinCountKey, asinObject);
    Apify.events.on('persistState', persistObject); 
    setInterval(() => { logObject(asinObject); }, logInterval);

    const requestQueue = await Apify.openRequestQueue();
    const startUrl = 'https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords='+ INPUT.keyword;
    await requestQueue.addRequest({ 'url': startUrl });
    
    const crawler = new Apify.CheerioCrawler({
        
        requestQueue,
        useApifyProxy: true,
        useSessionPool: true,
        persistCookiesPerSession: true,
        // Be nice to the websites.
        // Remove to unleash full power.
        maxConcurrency: 1,
        //for debugging
        timeOut:1000,
        // You can remove this if you won't
        // be scraping any JSON endpoints.
        additionalMimeTypes: [
            'application/json',
        ],
        handlePageFunction: async (context) => {
            const { url, userData: { label } } = context.request;
            log.info('Page opened.', { label, url });
            await Apify.utils.sleep(10000);
            switch (label) {
                case 'NEXT_URL':
                    return handleNextURL(context, INPUT);
                case 'DETAIL':
                    return handleDetail(context,persistObject);
                default:
                    return handleStart(context);
            }
        },
    });

    log.info('Starting the crawl.');
    await crawler.run();
    log.info('Crawl finished.');
    logObject();
    persistObject();
});
