import axios from "axios";
import {writeFile, utils} from "xlsx";


export const Filter = {
    findKey: function(item) {
        let keys = Object.keys(item);
        return (value) => {
            let fnKey = null;
            for(let i of keys) if(i.includes(value)) {fnKey=i; break;}
            return item[fnKey];
        }
    },
    filterDataByFirstName: function(data, firstName) {
        return data.filter(i=>{
            let first_name = this.findKey(i)('first_name');
            return(first_name.slice(0, firstName.length).toUpperCase() == firstName.toUpperCase());
        })
    },
    filterDataByLastName: function(data, lastName){
        return data.filter(i=>{
            let last_name = this.findKey(i)('last_name');
            return(last_name.slice(0, lastName.length).toUpperCase() == lastName.toUpperCase());
        }
    )},
    filterDataByExactAmount: function(data, amount){
        return data.filter(i=>
            i.total_amount_of_payment_usdollars.slice(0,amount.toString().length) == amount)
    },
    filterDataByAmountRange: function(data, amountFrom, amountTo){
        return data.filter(i=>{
            let payment_amount = i.total_amount_of_payment_usdollars;
            return(payment_amount >= Number(amountFrom) && payment_amount <= Number(amountTo));
        }
    )},
    filterData: function({allData, firstName, lastName, amount, amountIsRange, amountFrom, amountTo, page, limit}){
        if(!allData?.length) return [];
        
        let data = allData;
        if(firstName) data = this.filterDataByFirstName(data, firstName);
        if(lastName) data = this.filterDataByLastName(data, lastName);

        if(amount && !amountIsRange) data = this.filterDataByExactAmount(data, amount);
        else if(amountIsRange && amountFrom && amountTo) data = this.filterDataByAmountRange(data, amountFrom, amountTo);
        return !limit ? data.slice(page,page+15) : data.slice(0,limit)
    },
}

export const APIcontroller = {
    hitEndPoint: function({year, limit, offset, yearTable}){
        
        return axios.get(`https://openpaymentsdata.cms.gov/api/1/datastore/query/${year}/0?offset=${offset}&count=true&results=true&schema=true&keys=true&format=json&rowIds=false`)
    },
    hitAPIwithExactYear: function(year, lookUpTable){
        if(!year) return;
        let fnKey;
        let lnKey;
        if(year == 2015) {
            fnKey = 'physician_first_name';
            lnKey = 'physician_last_name';
        }else{
            fnKey = 'covered_recipient_first_name';
            lnKey = 'covered_recipient_last_name';
        }

        return this.hitEndPoint({year:lookUpTable[year], offset:0})
    },
    hitAPIwithRangeOfYears: function(yearFrom, yearTo, lookUpTable){
        if(!yearFrom || !yearTo) return;
        let promises = [];
        for(let i=Number(yearFrom); i<=Number(yearTo); i++){
            promises.push(this.hitEndPoint({year:lookUpTable[i], offset:0}));
        }
        return Promise.all(promises)
            .then(results => {
                let localData = [];
                for(let i of results) localData = [...localData, ...i.data.results];
                return localData;
            })
            .catch(err => console.log(err));
    },
    grabMoreDataExactYear: async function({offset, year}){
        const moreData = await this.hitEndPoint({year, offset});
        return moreData
    },
    grabMoreDataWithRange: function({offset, yearFrom, yearTo, lookUpTable, limits, dataCounts}){
        let promises = [];
        //if(!(Object.keys(dataCounts).length)) dataCounts = {}; //If dataCounts is an empty object 
        for(let i=Number(yearFrom); i<=Number(yearTo); i++){
            if(!dataCounts[i]) dataCounts[i] = 500;
            else dataCounts[i] += 500;
            promises.push(this.hitEndPoint({year:lookUpTable[i], offset}))
        }
        return Promise.all(promises)
            .then(results =>{
                let localData = [];
                for(let i of results) localData = [...localData, ...i.data.results];
                return localData;
            })
            .catch(err=>console.log(err))
    },
    findAndReturnLimits: function(lookUpTable){
        const MIN = Number(Object.keys(lookUpTable)[0]);
        const MAX = Number(Object.keys(lookUpTable)[Object.keys(lookUpTable).length-1]);
        let promises = [];
        for(let i=MIN; i<=MAX; i++){
            promises.push(this.hitEndPoint({year:lookUpTable[i], offset:0}));
        }
        return Promise.all(promises)
            .then(results => {
                let counts = {};
                for(let i=0; i<results.length; i++)counts[MIN+i] = results[i].data.count;
                return counts;
            })
            .catch(err => console.log(err));
    },   
}

export const ExportController = {
    handleExport:(data) => {
        const ws = utils.json_to_sheet(data);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "Sheet1");
        const fileName = window.prompt('Enter the name of your file') + '.xls'
        writeFile(wb, fileName || 'untitled_data'+'.xls')
    }
}