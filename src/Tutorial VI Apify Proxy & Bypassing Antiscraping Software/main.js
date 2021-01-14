const Apify = require('apify'); 
const { handleStart, handleNextURL, handleDetail } = require('./routes');

const { utils: { log } } = Apify;

Apify.main(async () =>
{
   let INPUT = await Apify.getInput();

    if (!INPUT ||!INPUT.keyword)
    {
        log.info("No input, default keyword: samsung'")
        INPUT = {
            "keyword": "samsung"
        }
    } 
    
    
    const proxyConfiguration = await Apify.createProxyConfiguration({
        groups:['BUYPROXIES94952']
        
    });

    
    const requestQueue = await Apify.openRequestQueue();
    const startUrl = 'https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords='+ INPUT.keyword;
    await requestQueue.addRequest({'url':startUrl});
 
    const crawler = new Apify.CheerioCrawler({
        
        requestQueue,
        useSessionPool: true,
        persistCookiesPerSession: true,
        proxyConfiguration,
        sessionPoolOptions:
        {
            sessionOptions:
            {
                maxUsageCount: 5
            }
        },
        maxConcurrency: 1,
        maxRequestRetries:5,
        //for debugging
        handlePageTimeoutSecs:1000,
        handlePageFunction: async (context) =>
        {
            try
            {
                const { url, userData: { label } } = context.request;
            
                log.info('Page opened.', { label, url });
                switch (label)
                {
                    case 'NEXT_URL':
                        return await handleNextURL(context, INPUT);
                    case 'DETAIL':
                        return await handleDetail(context);
                    default:
                        return await handleStart(context);
                }
            }
            catch (error)
            {
                const { session } = context;
                session.markBad();
                throw (error);
                
            }
        },

    });

    log.info('Starting the crawl.');
    await crawler.run();
    log.info('Crawl finished.');    
    
});
