









const { APIcontroller, Filter } = require("./resultsController");























self.onmessage = async function(msg) {
    const { data, args, offset, gmdArgs } = msg;
    const { allData, firstName, lastName, amount, amountIsRange, amountFrom, amountTo, page } = args
    let myOffset = offset;
    let results = [];
    while(Filter.filterData({ allData:[...allData, ...results], firstName, lastName, amount,
            amountIsRange, amountFrom, amountTo, page }).length < 15)
    {
        let r = await APIcontroller.grabMoreDataExactYear({ year: gmdArgs.year, offset: myOffset, currentData:gmdArgs.currentData });
        results = [...results, ...r.data.results];
        myOffset += 500;
        self.postMessage(results)
    }

}
