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
        log.info("No input, default keyword: samsung")
        INPUT = {
            "keyword": "samsung"
        }
    }

    const asinObject = await Apify.getValue(KVSAsinCountKey) || {};
    const logObject = () =>
    {
        if (asinObject != {})
            log.info(new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }), asinObject);
    };
    const persistObject = async function () { return await Apify.setValue(KVSAsinCountKey, asinObject) };
    Apify.events.on('persistState', persistObject); 
    setInterval(() =>
    {
        logObject(asinObject);
        persistObject();
    }, logInterval);

    const requestQueue = await Apify.openRequestQueue();
    const startUrl = 'https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords='+ INPUT.keyword;
    await requestQueue.addRequest({ 'url': startUrl });
    const proxyConfiguration = await Apify.createProxyConfiguration() 
    const crawler = new Apify.CheerioCrawler({
        
        requestQueue,
        
        useSessionPool: true,
        persistCookiesPerSession: true,
        proxyConfiguration,
        // Be nice to the w ebsites.
        // Remove to unleash full power.
        maxConcurrency: 1,
        //for debugging
        handlePageTimeoutSecs:1000,
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
                    return handleDetail(context,asinObject,persistObject);
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
