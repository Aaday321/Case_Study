 const Filter = {
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

















onmessage =  function(msg) {
    console.log(1);
    const { allData, firstName, lastName, amount, amountIsRange, page, limit } = msg.data;
    const  filteredData = Filter.filterData({ allData, firstName, lastName, amount, amountIsRange, page, limit });
    self.postMessage(filteredData);
}
