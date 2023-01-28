import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios';
import { Filter, APIcontroller } from '../resultsController';
import { v4 as uuidv4 } from 'uuid';
import ResultsRow from './ResultsRow';

function Results({statePackage, dataNeedsRefresh}) {

    //const [ nextOffset, setNextOffset ] = useState(0);
    const [ page, setPage ] = useState(0);

    const [ isSearching, setIsSearching ] = useState(false);

    const initialLoad = useRef(true); //HOPE THIS WORKS 
    const [offset, setOffset ] = useState(0);

    const { firstName, lastName, dataSetIds } = statePackage;
    const { yearPackage, amountPackage } = statePackage;
    const [ yearRangeToggle, yearRange, exactYear ] = yearPackage;
    const [ amountRangeToggle, amountRange, exactAmount ] = amountPackage;

    const [ limits, setLimits ] = useState({});

    const [ allData, setAllData ] = useState([]);

    const [ limitHit, setLimitHit ] = useState(true);

    const yearIsRange = yearRangeToggle[0];
    const [ yearFrom, yearTo ] = yearRange[0];
    const year = exactYear[0];

    const amountIsRange = amountRangeToggle[0];
    const [ amountFrom, amountTo ] = amountRange[0];
    const amount = exactAmount[0];

    //Sets limits in state
    APIcontroller.findAndReturnLimits(dataSetIds).then(r=>setLimits(r))

    //Hit API again anytime a value relating to the year is changed or if data needs to be refreshed
    useEffect(()=>{
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
    },[ yearFrom, yearTo, year, dataNeedsRefresh ]);

    //Reset the pages every time a value relating to name or amount changes
    useEffect(()=>{setPage(0); setLimitHit(false)},[firstName, lastName, amount, amountFrom, amountTo])

    //look at the length of the filtered data and decide if it needs more
    useEffect(()=>{
        const args = { allData, firstName, lastName, amount, amountIsRange, amountFrom, amountTo, page };
        let itemsOnPage = Filter.filterData(args).length;
        if(itemsOnPage < 15 && allData.length > 0){
            if(initialLoad.current == false) setIsSearching(true);
            initialLoad.current = true;
            console.log('searching...');
            if(!yearIsRange && year){
                setOffset(c=>{
                    if(limitHit) return limits[year]; //Don't make an API call if the limit is hit
                    const itemsLeft = limits[year] - c;
                    let nextOffset = c+500;
                    let blockLevelLimitHit = false;
                    if(itemsLeft - 500 <= 0) {
                        nextOffset = 500 - itemsLeft;
                        setLimitHit(true);
                        blockLevelLimitHit = true;
                    }
                    if(blockLevelLimitHit) return limits[year];
                    APIcontroller.grabMoreDataExactYear({year: dataSetIds[year], offset: nextOffset})
                        .then(r=>{
                            setAllData(cur=>[...cur, ...r.data.results]);
                        });
                    return nextOffset;
                })
            }else if(yearIsRange && yearFrom && yearTo && itemsOnPage < 15){
                setOffset(c=>{
                    let nextOffset = c+500;
                    APIcontroller.grabMoreDataWithRange({offset:nextOffset, yearFrom, yearTo, dataSetIds, dataCounts:limits})
                        .then(r=>setAllData(cur=>{
                            let concat = [...cur, ...r];
                            console.log(concat.length);
                            return concat;
                        }))
                    return nextOffset;
                })
            }
        } else setIsSearching(false);
        return ()=>{initialLoad.current = false}
    },[page, firstName, allData, lastName, amount, amountFrom, amountTo]);



    const test = Filter.filterData({allData, firstName, lastName, amount, amountIsRange, amountFrom, amountTo, page}).map( function(i,index,thisArray) {
        let localSearch = Filter.findKey(i);
        let firstName = localSearch('first_name');
        let lastName = localSearch('last_name');
        let UNLISTED = 'UNLISTED';
        let paymentAmount = i.total_amount_of_payment_usdollars;
        return (
            <li key={uuidv4()}>
                 <ResultsRow number={index+page} firstName={firstName} lastName={lastName} paymentAmount={paymentAmount} index={index}/>
            </li>
            );
    })
    
    return(
        <div className='resultsSection'>
            <div className="infoRow">
                <p>{isSearching && allData.length > 0 && 'Searching...'}</p>
                <p>Searched through {allData.length.toLocaleString("en-US")} results</p>
            </div>
            <ul className='resultsBox'>
                {test}
            </ul>
            <div className="btns">
                <button
                    className={page < 15 ? 'notClickable prev' : 'clickable prev'}
                    onClick={()=>setPage(c=>{
                        if(c>0) return c-15;
                        else return 0;
                    })}
                >
                    {'< Previous'}
                </button>

                <button
                    className={ isSearching ? 'notClickable' : 'clickable' }
                    onClick={()=>isSearching ?  null : setPage(c=>c+15)}
                >
                    {'Next >'}
                </button>
                <button className='exportBtn'>Export Filtered Results</button>
            </div>
        </div>
    )
}

export default Results;