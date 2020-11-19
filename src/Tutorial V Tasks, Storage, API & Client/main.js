const Apify = require('apify'); 
const ApifyClient = require('apify-client');
const { utils: { log } } = Apify;
const axios = require('axios').default;

Apify.main(async () =>
{ 
    //default input for testing
    let INPUT = {
        "memory": 4096, // Memory has to be a power of 2
        "useClient": false,
        "fields": ["title", "url", "price"],
        "maxItems": 10
    }
    if (Apify.isAtHome())
    {
        INPUT = await Apify.getInput();
    }


    if (!INPUT || INPUT == {})
    {
        log.info("No input");
        return;
    }

    console.log(INPUT);

    const amazonScraperTaskId = "MpEHxpusHMW3UteqL";

    const token = (process.env.APIFY_TOKEN) ? process.env.APIFY_TOKEN : process.env.MY_APIFY_TOKEN;

    const apifyClient = new ApifyClient({
    userId: process.env.APIFY_USER_ID,
    token: token
    });

    log.info('starting task');
        let runInfo = (!INPUT.useClient) ?
        (await axios.post(`https://api.apify.com/v2/actor-tasks/${amazonScraperTaskId}/runs?token=${token}&memory=${INPUT.memory}`)).data.data :
        await apifyClient.tasks.runTask(
            {
                taskId:amazonScraperTaskId,
                memory: INPUT.memory
            });
  
    log.info('polling');
    //polling
    let finished = false; 
    while (!finished) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        result = (!INPUT.useClient) ? (await axios.get(`https://api.apify.com/v2/acts/${runInfo.actId}/runs/${runInfo.id}`)).data.data:
            await apifyClient.acts.getRun(
            {
                actId: runInfo.actId,
                runId: runInfo.id
                });
        log.info(result.status);
        finished = result.status == "SUCCEEDED";
       
      }
    
    
    //get data from default dataset of the run
    log.info('get data from dataset');
    const csvData = (!INPUT.useClient) ? (await axios.get
        (`https://api.apify.com/v2/datasets/${runInfo.defaultDatasetId}/items?token=${token}&format=csv&limit=${INPUT.maxItems}&fields=${INPUT.fields.join(',')}`)).data :
        await apifyClient.datasets.getItems(
            {
                datasetId: runInfo.defaultDatasetId,
                format: 'csv',
                limit: 10,
                fields: INPUT.fields
            }).items;
    
    const defaultKVSId = (process.env.APIFY_DEFAULT_KEY_VALUE_STORE_ID) ? process.env.APIFY_DEFAULT_KEY_VALUE_STORE_ID : 'default';

    
    //put csv to the KVS
    log.info('set output.csv to KVS')
    if (Apify.isAtHome())
    {
        if (!INPUT.useClient)
        {
            const result = await axios.post(`https://api.apify.com/v2/key-value-stores/${defaultKVSId}/records/output.csv?token=${token}`,
                {
                    data: csvData,
                    headers:
                    {
                        'Content-Type': 'text/plain'
                    }
                });
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
    log.info('Finished');
})