import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { Filter, APIcontroller } from '../resultsController';
import { v4 as uuidv4 } from 'uuid';

function Results({statePackage}) {

    //const [ nextOffset, setNextOffset ] = useState(0);
    const [ page, setPage ] = useState(0);

    const [offset, setOffset ] = useState(0);
    let moreDataNeeded = false;
    let once = true;

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

    const worker = new Worker('./src/worker.js');

    //Hit API again anytime a value relating to the year is changed
    useEffect(()=>{
        console.log('ran');
        setPage(0);
        if(!yearIsRange && year) {
            APIcontroller.hitAPIwithExactYear(year, dataSetIds)
                ?.then(r=>setAllData(r.data.results))
                ?.catch(err=>console.log(err));
        }
        else if(yearIsRange && yearFrom && yearTo) {
            APIcontroller.hitAPIwithRangeOfYears(yearFrom, yearTo, dataSetIds)
                ?.then(r=>setAllData(r))
                ?.catch(err=>console.log(err));
        }
    },[ yearFrom, yearTo, year, yearIsRange ]);

    //Reset the pages every time a value relating to name or amount changes
    useEffect(()=>{
        setPage(0)
    },[firstName, lastName, amount, amountFrom, amountTo])

    //get more data if there isn't enough data on the page
    useEffect(()=>{
        return
        console.log(once);
        console.log(moreDataNeeded);
        if(moreDataNeeded && once) {
            //APIcontroller.grabMoreDataExactYear({year:dataSetIds[year], offset, currentData:allData}).then(r=>setAllData(r))
            console.log('?');
            once = false;
            moreDataNeeded = false
        }
    },[firstName, lastName, amount, amountFrom, amountTo, page])

    //look at the length of the filtered data and decide if it needs more
    useEffect(()=>{
        const args = { allData, firstName, lastName, amount, amountIsRange, amountFrom, amountTo, page };
        const gmdArgs = {year:dataSetIds[year], offset:500, currentData:allData}
        worker.postMessage({allData, args, offset, gmdArgs})
        worker.onmessage = r => setAllData(data=>[...data, ...r]);
        
    },[page, firstName])

    useEffect(()=>console.log(allData.length),[allData])

    return(
        <>
        <ul>
            {Filter.filterData({allData, firstName, lastName, amount, amountIsRange, amountFrom, amountTo, page}).map( function(i,index,thisArray) {
                //TODO rewrite this so that we're only mapping over the data that gets rendered
                //So that means find a way to filter or slice before use of the .map method

               

                let localSearch = Filter.findKey(i);
                let firstName = localSearch('first_name');
                let lastName = localSearch('last_name');
                let UNLISTED = 'UNLISTED';
                let paymentAmount = i.total_amount_of_payment_usdollars;
                if(!firstName && !lastName) return <li key={uuidv4()}>{UNLISTED}{' $'}{paymentAmount}</li>;
                else return <li key={uuidv4()}>{firstName || UNLISTED}{' '}{lastName || UNLISTED}{' $'}{paymentAmount}</li>;
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