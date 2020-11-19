const Apify = require('apify'); 
const ApifyClient = require('apify-client');
const { utils: { log } } = Apify;
const fetch = require('node-fetch');

Apify.main(async () =>
{ 
    //const INPUT = await Apify.getInput();
    const INPUT = {
        "memory": 4096, // Memory has to be a power of 2
        "useClient": false,
        "fields": ["title", "url", "price"],
        "maxItems": 10
    }

    if (!INPUT || INPUT == {})
    {
        log.info("No input");
        return;

        
    }

    const amazonScraperTaskId = "MpEHxpusHMW3UteqL";

    const token = (process.env.APIFY_TOKEN) ? process.env.APIFY_TOKEN : process.env.MY_APIFY_TOKEN;

    const apifyClient = new ApifyClient({
    userId: process.env.APIFY_USER_ID,
    token: token
    });

    //execute Task and get actor run Id
    let runInfo = (!INPUT.useClient) ?
        (await (await fetch(`https://api.apify.com/v2/actor-tasks/${amazonScraperTaskId}/runs?token=${token}&memory=${INPUT.memory}`,
            {method:'POST'})).json()).data :
        await apifyClient.tasks.runTask(
            {
                taskId:amazonScraperTaskId,
                memory: INPUT.memory
            });
   
    //polling
    let finished = false; 
    while (!finished) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        result = (!INPUT.useClient) ? (await (await fetch(`https://api.apify.com/v2/acts/${runInfo.actId}/runs/${runInfo.id}`)).json()).data:
            await apifyClient.acts.getRun(
            {
                actId: runInfo.actId,
                runId: runInfo.id
            });
        finished = result.status == "SUCCEEDED";
       
      }
    
    //get data from default dataset of the run
    const csvData = (!INPUT.useClient) ? (await (await fetch
        (`https://api.apify.com/v2/datasets/${runInfo.defaultDatasetId}/items?token=${token}&format=csv&limit=${INPUT.maxItems}&fields=${INPUT.fields.join(',')}`)).text()) :
        await apifyClient.datasets.getItems(
            {
                datasetId: runInfo.defaultDatasetId,
                format: 'csv',
                limit: 10,
                fields: INPUT.fields
            }).items;
    
    const defaultKVSId = (process.env.APIFY_DEFAULT_KEY_VALUE_STORE_ID) ? process.env.APIFY_DEFAULT_KEY_VALUE_STORE_ID : 'default';

    //put csv to the KVS
    if (Apify.isAtHome())
    {
        if (!INPUT.useClient)
        {
            const result = await fetch(`https://api.apify.com/v2/key-value-stores/${defaultKVSId}/records/output.csv?token=${token}`,
                {
                    method: 'post',
                    body: csvData,
                    headers:
                    {
                        'Content-Type': 'text/csv'
                    }
                });
            console.log(result);
        }
        else
        {
            await keyValueStores.putRecord({
                storeId: defaultKVSId,
                key: 'output.csv',
                body: csvData,
                contentType: 'text/csv',
            });
        }
    }
    else
    { 
        await Apify.setValue('output.csv', csvData);
    }
})