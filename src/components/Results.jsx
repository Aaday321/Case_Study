import React, { useEffect, useState } from 'react'
import axios from 'axios';

function Results({statePackage}) {

    const [ offset, setOffset ] = useState(0)

    const [ dataCountOnPage, setDataCountOnPage ] = useState(10)

    const { firstName, lastName, dataSetIds } = statePackage;
    const { yearPackage, amountPackage } = statePackage;
    const [ yearRangeToggle, yearRange, exactYear ] = yearPackage;
    const [ amountRangeToggle, amountRange, exactAmount ] = amountPackage;

    const [ allData, setAllData ] = useState([]);

    const yearIsRange = yearRangeToggle[0];
    const [ yearFrom, yearTo ] = yearRange[0];
    const year = exactYear[0];

    const amountIsRange = amountRangeToggle[0];
    const [ amountFrom, amountTo ] = amountRange[0];
    const amount = exactAmount[0];

    const { OPEN_BRACKET, CLOSE_BRACKET, SPACE, WHERE, SELECT, FROM, LIMIT, OFFSET, SELECT_FROM, FIRST_NAME, LAST_NAME, LIKE } = {
        OPEN_BRACKET: '%5B',
        CLOSE_BRACKET: '%5D',
        SPACE: '%20',
        WHERE: 'WHERE',
        SELECT: 'SELECT',
        FROM: 'FROM',
        LIMIT: 'LIMIT',
        OFFSET: 'OFFSET',
        SELECT_FROM: 'Covered_Recipient_First_Name,Covered_Recipient_Last_Name,Total_Amount_of_Payment_USDollars',
        FIRST_NAME: 'Covered_Recipient_First_Name',
        LAST_NAME: 'Covered_Recipient_Last_Name',
        LIKE: 'LIKE',
        AND: 'AND'
    };

    const hitEndPoint = ({year, limit, offset}) =>
        axios.get(`https://openpaymentsdata.cms.gov/api/1/datastore/query/${year}/0?offset=${offset}&count=true&results=true&schema=true&keys=true&format=json&rowIds=false`)

    const hitAPIwithExactYear = () => {
        if(!year) return;
        hitEndPoint({year:dataSetIds[year], offset:0})
            .then(r=>{
                setAllData(r.data.results);
            })
    }

    const hitAPIwithRangeOfYears = () => {
        if(!yearFrom || !yearTo) return;
        setAllData([]);
        for(let i=yearFrom; i<=yearTo; i++){
            hitEndPoint({year:dataSetIds[i], offset:0})
                .then(r=>{
                    setAllData(c=>[...c, ...r.data.results])
                })
        }
    }

    const findKey = item => {
        let keys = Object.keys(item);
        return (value) => {
            let fnKey = null;
            for(let i of keys) if(i.includes(value)) {fnKey=i; break;}
            return item[fnKey];
        }
    }
    
    const filterData = () => {
        if(!allData.length) return [];
        let data = allData;
        if(firstName) data = filterDataByFirstName(data);
        if(lastName) data = filterDataByLastName(data);

        if(amount && !amountIsRange) data = filterDataByExactAmount(data);
        else if(amountIsRange && amountFrom && amountTo) data = filterDataByAmountRange(data);
        return data;
    }

    const filterDataByFirstName = data => data.filter(i=>{
        let first_name = findKey(i)('first_name');
        return(first_name.slice(0, firstName.length) == firstName.toUpperCase());
    })
    

    const filterDataByLastName = data => data.filter(i=>{
        let last_name = findKey(i)('last_name');
        return(last_name.slice(0, lastName.length) == lastName.toUpperCase());
    })

    const filterDataByExactAmount = data => data.filter(i=>
        i.total_amount_of_payment_usdollars.slice(0,amount.toString().length) == amount);
    
    const filterDataByAmountRange = data => data.filter(i=>{
        let payment_amount = i.total_amount_of_payment_usdollars;
        return(payment_amount >= Number(amountFrom) && payment_amount <= Number(amountTo));
         
    })
   

    useEffect(()=>{
        if(!yearIsRange && exactYear) hitAPIwithExactYear();
        else if(yearIsRange && yearFrom && yearTo) hitAPIwithRangeOfYears();
    },[
        firstName, lastName,
        yearFrom, yearTo, exactYear, yearIsRange,
        amountFrom, amountTo, exactAmount, amountIsRange
    ]);

    return(
        <ul>
            {filterData().map( i => {
                //TODO rewrite this so that we're only mapping over the data that gets rendered
                //So that means find a way to filter or slice before use of the .map method
                let localSearch = findKey(i);
                let firstName = localSearch('first_name');
                let lastName = localSearch('last_name');
                let UNLISTED = 'UNLISTED';
                let paymentAmount = i.total_amount_of_payment_usdollars;
                if(!firstName && !lastName) return <li>{UNLISTED}{' $'}{paymentAmount}</li>;
                else return <li>{firstName || UNLISTED}{' '}{lastName || UNLISTED}{' $'}{paymentAmount}</li>;
            }).filter((i,index)=>{
                if(index === filterData().length-1 && index < 15) {}
                return (index<=15);
            })}
        </ul>
    )

    return (
        <>
        <p>First Name: {firstName}</p>
        <p>Last Name: {lastName}</p>
        <p>Year is Range: {yearIsRange && 'True' || 'False'}</p>
        <p>Year From: {yearFrom}</p>
        <p>Year To: {yearTo}</p>
        <p>Year Exact: {year}</p>
        <p>Amount is Range: {amountIsRange && 'True' || 'False'}</p>
        <p>Amount From: {amountFrom}</p>
        <p>Amount To: {amountTo}</p>
        <p>Amount Exact: {amount}</p>
        <p>Query information: </p>
        </>
    )
}

export default Results

/*
'https://openpaymentsdata.cms.gov/api/1/datastore/sql
?query=
%5B
SELECT
%20
Change_Type
%20
FROM
%20 
b21fe89c-f404-5af6-8ffa-1cd6252d7a00
%5D
%5B
LIMIT
%20
2
%5D'
*/