const Apify = require('apify'); 
const { utils: { log } } = Apify;

Apify.main(async () =>
{ 
    const INPUT = await Apify.getInput();
    //const INPUT = await Apify.openDataset('VsMpzlvKxu57bZh2t', { forceCloud: true });
    if (!INPUT || INPUT == {})
    {
        log.info("No input");
        return;

        
    }
    log.info(INPUT);

    
    const getPriceNumber = (x) => { return parseFloat(x.replace('$', '')) };
    const sameAsinGroups = Object.entries(INPUT.reduce((acc, item) =>
    {
        (acc[item.itemUrl] = acc[item.itemUrl] || []).push(item);
        return acc;
    }, {}));
    const cheapestDealers = sameAsinGroups.map(x => x[1].reduce((acc, item) =>
    {
        return (getPriceNumber(acc.price) < getPriceNumber(item.price)) ? acc : item;
    }));

    const dataset = Apify.openDataset();
    await dataset.pushData(cheapestDealers);
    log.info('Data Pushed');

 

})
