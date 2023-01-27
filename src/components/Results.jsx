import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { Filter, APIcontroller } from '../resultsController';

function Results({statePackage}) {

    //const [ nextOffset, setNextOffset ] = useState(0);
    const [ page, setPage ] = useState(0);

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

    //Hit API again anytime a value relating to the year is changed
    useEffect(()=>{
        setPage(0);
        if(!yearIsRange && exactYear) {
            setAllData([]);
            APIcontroller.hitAPIwithExactYear(year, dataSetIds)
                ?.then(r=>setAllData(r.data.results))
                ?.catch(err=>console.log(err));
        }
        else if(yearIsRange && yearFrom && yearTo) {
            setAllData([]);
            APIcontroller.hitAPIwithRangeOfYears(yearFrom, yearTo, dataSetIds)
                ?.then(r=>setAllData(r))
                ?.catch(err=>console.log(err));
        }
    },[ yearFrom, yearTo, exactYear, yearIsRange ]);

    //Reset the pages every time a value relating to name or amount changes
    useEffect(()=>{
        setPage(0);
    },[firstName, lastName, amount, amountFrom, amountTo])

    return(
        <>
        <ul>
            {Filter.filterData({allData, firstName, lastName, amount, amountIsRange, amountFrom, amountTo, page}).map( i => {
                //TODO rewrite this so that we're only mapping over the data that gets rendered
                //So that means find a way to filter or slice before use of the .map method
                let localSearch = Filter.findKey(i);
                let firstName = localSearch('first_name');
                let lastName = localSearch('last_name');
                let UNLISTED = 'UNLISTED';
                let paymentAmount = i.total_amount_of_payment_usdollars;
                if(!firstName && !lastName) return <li>{UNLISTED}{' $'}{paymentAmount}</li>;
                else return <li>{firstName || UNLISTED}{' '}{lastName || UNLISTED}{' $'}{paymentAmount}</li>;
            })}
        </ul>
        <button onClick={()=>setPage(c=>{
            if(c>0) return c-15;
            else return 0;
        })}>Previous</button>
        <button onClick={()=>setPage(c=>c+15)}>Next</button>
        </>
    )
}

export default Results;