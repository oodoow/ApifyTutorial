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
        useApifyProxy: true,
        useSessionPool: true,
        persistCookiesPerSession: true,
        proxyConfiguration: proxyConfiguration,
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
        timeOut: 1000,
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

    let dataset = await Apify.openDataset();
    let info = await dataset.getInfo();
    
    const options = (process.env.APIFY_TOKEN) ? {} : { token: process.env.MY_APIFY_TOKEN };
    const datasetLink = `https://api.apify.com/v2/datasets/${info.id}/items?format=json&clean=1`
    
    if (Apify.isAtHome())
    {
        log.info('Sending email with results link');
        const result = await Apify.call('apify/send-mail',
            {
                to: 'oodoow@gmail.com',
                subject: 'Jan Suchomel - This is for the Apify SDK exercise',
                text: datasetLink
            },
            options);
    }
});
