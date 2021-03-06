/** 
 * This template is a production ready boilerplate for developing with `CheerioCrawler`.
 * Use this to bootstrap your projects using the most up-to-date code.
 * If you're looking for examples or want to learn more, see README.
 */

const Apify = require('apify'); 
const { handleStart, handleNextURL, handleDetail } = require('./routes');

const { utils: { log } } = Apify;

Apify.main(async () =>
{
   let INPUT = await Apify.getInput();

    if (!INPUT ||!INPUT.keyword)
    {
        log.info("No input, default keyword: samsung")
        INPUT = {
            "keyword": "samsung"
        }
    }  

    const requestQueue = await Apify.openRequestQueue();
    const startUrl = 'https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords='+ INPUT.keyword;
    await requestQueue.addRequest({ 'url': startUrl });
    //const proxyConfiguration = await Apify.createProxyConfiguration() 
 
    const crawler = new Apify.CheerioCrawler({
        
        requestQueue,
        //proxyConfiguration,
        useSessionPool: true,
        persistCookiesPerSession: true,
        // Be nice to the websites.
        // let it be 1 so we will not get captcha too soon
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
            switch (label) {
                case 'NEXT_URL':
                    return handleNextURL(context, INPUT);
                case 'DETAIL':
                    return handleDetail(context);
                default:
                    return handleStart(context);
            }
        },
    });

    log.info('Starting the crawl.');
    await crawler.run();
    log.info('Crawl finished.');

    let dataset = await Apify.openDataset();
    let info = await dataset.getInfo();
    
    //for same code on the platform and local development
    const options = (process.env.APIFY_TOKEN) ? {} : { token: process.env.MY_APIFY_TOKEN };
    
    const datasetLink = `https://api.apify.com/v2/datasets/${info.id}/items?format=json&clean=1`
    log.info('Sending email with results link');
    const result = await Apify.call('apify/send-mail',
    {
        to: 'lukas@apify.com',
        subject: 'Jan Suchomel - This is for the Apify SDK exercise',
        text: datasetLink
    },
        options);
});
