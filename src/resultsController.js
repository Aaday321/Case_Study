import axios from "axios";

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
    filterData: function({allData, firstName, lastName, amount, amountIsRange, amountFrom, amountTo, page}){
        if(!allData.length) return [];
        let data = allData;
        if(firstName) data = this.filterDataByFirstName(data, firstName);
        if(lastName) data = this.filterDataByLastName(data, lastName);

        if(amount && !amountIsRange) data = this.filterDataByExactAmount(data, amount);
        else if(amountIsRange && amountFrom && amountTo) data = this.filterDataByAmountRange(data, amountFrom, amountTo);
        let results = data.slice(page,page+15);
        return results;
    },
}

export const APIcontroller = {
    hitEndPoint: function({year, limit, offset}){
        return axios.get(`https://openpaymentsdata.cms.gov/api/1/datastore/query/${year}/0?offset=0&count=true&results=true&schema=true&keys=true&format=json&rowIds=false`)
    },
    hitAPIwithExactYear: function(year, dataSetIds){
        if(!year) return;
        return this.hitEndPoint({year:dataSetIds[year], offset:0})
    },
    hitAPIwithRangeOfYears: function(yearFrom, yearTo, dataSetIds){
        if(!yearFrom || !yearTo) return;
        let promises = [];
        for(let i=Number(yearFrom); i<=Number(yearTo); i++){
            promises.push(this.hitEndPoint({year:dataSetIds[i], offset:0}));
        }
        return Promise.all(promises)
            .then(results => {
                let localData = [];
                for(let i of results){
                    localData = [...localData, ...i.data.results]
                }
                return localData;
            })
            .catch(error => {
                throw error;
            });
    }
    
}