import React, { useEffect, useState, useRef } from 'react'
import axios, { all } from 'axios';
import { Filter, APIcontroller, ExportController } from '../resultsController';
import { v4 as uuidv4 } from 'uuid';
import ResultsRow from './ResultsRow';
import {animate, motion} from 'framer-motion'

function Results({statePackage, dataNeedsRefresh, setDataNeedsRefresh}) {

    //const [ nextOffset, setNextOffset ] = useState(0);
    const [ page, setPage ] = useState(0);

    const [resultsSearched, setResultsSearched] = useState(0)

    const counter = useRef(0)
    const initialLoad = useRef(true)
    const [ isSearching, setIsSearching ] = useState(false);

    const [offset, setOffset ] = useState(0);

    const { firstName, lastName, lookUpTable, setGlobalOffset } = statePackage;
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
    useEffect(()=>{APIcontroller.findAndReturnLimits(lookUpTable).then(r=>setLimits(r))},[])

    //Hit API again anytime a value relating to the year is changed or if data needs to be refreshed
    useEffect(()=>{
        setPage(0);
        if(!yearIsRange && year) {
            APIcontroller.hitAPIwithExactYear(year, lookUpTable)
                ?.then(r=>setAllData(r.data.results))
                ?.catch(err=>console.log(err));
        }
        else if(yearIsRange && yearFrom && yearTo) {
            APIcontroller.hitAPIwithRangeOfYears(yearFrom, yearTo, lookUpTable)
                ?.then(r=>setAllData(r))
                ?.catch(err=>console.log(err));
        }
        setDataNeedsRefresh(false);
    },[ yearFrom, yearTo, year, dataNeedsRefresh ]);

    //Reset Offset to recheck previously checked data when needed
        //This is now important because we are not store all previously Searched items in state
    useEffect(()=>{setOffset(0)},[
        firstName, lastName, year,
        yearFrom, yearTo, dataNeedsRefresh,
        amount, amountFrom, amountTo
    ]);

    //Update Global Offset
    useEffect(()=>{setGlobalOffset(offset)},[offset]);

    //Reset the pages every time a value relating to name or amount changes
    useEffect(()=>{setPage(0); setLimitHit(false)},[firstName, lastName, amount, amountFrom, amountTo])

    //look at the length of the filtered data and decide if it needs more
    useEffect(()=>{
        const args = { allData, firstName, lastName, amount, amountIsRange, amountFrom, amountTo, page };
        let itemsOnPage = Filter.filterData(args).length;
        if(itemsOnPage < 15 && allData.length > 0){
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
                    setIsSearching(true);
                    APIcontroller.grabMoreDataExactYear({year: lookUpTable[year], offset: nextOffset})
                        .then(r=>{
                            setAllData(cur=>{
                                let concat = [...cur, ...r.data.results]; 

                                // Quality checking the data
                                const values = concat.map(obj => JSON.stringify(obj));
                                const filteredArray = concat.filter((obj, i) => values.indexOf(JSON.stringify(obj)) === i);
                                //This quality check is not performant but is necessary until a better caching strategy is implemented     

                                if(cur.length > 1_000)
                                    return Filter.filterData({allData:filteredArray, firstName, lastName, amount, amountIsRange, amountFrom, amountTo, page, limit:Infinity});
                                else  return filteredArray;
                                
                            });
                        });
                    return nextOffset;
                })
            }else if(yearIsRange && yearFrom && yearTo && itemsOnPage < 15){
                setOffset(c=>{
                    let nextOffset = c+500;
                    setIsSearching(true);
                    APIcontroller.grabMoreDataWithRange({offset:nextOffset, yearFrom, yearTo, lookUpTable, dataCounts:limits})
                        .then(r=>setAllData(cur=>{
                            let concat = [...cur, ...r]; 

                            // Quality checking the data
                            const values = concat.map(obj => JSON.stringify(obj));
                            const filteredArray = concat.filter((obj, i) => values.indexOf(JSON.stringify(obj)) === i);
                            //This quality check is not performant but is necessary until a better caching strategy is implemented     

                            if(cur.length > 1_000)
                                return Filter.filterData({allData:filteredArray, firstName, lastName, amount, amountIsRange, amountFrom, amountTo, page, limit:Infinity});
                            else return filteredArray;
                        }))
                    return nextOffset;
                })
            }
        } else if(itemsOnPage >= 15){setIsSearching(false)}
        return ()=>{initialLoad.current = false};
    },[page, firstName, allData, lastName, amount, amountFrom, amountTo]);



//Filtering twice here is not necessary and not performant. Rewriting the filterData method so that it does not need to be sorted twice is advisable
    //This would be accomplished by moving the limit value out of the object argument
const allMatches = Filter.filterData({allData, firstName, lastName, amount, amountIsRange, amountFrom, amountTo, page, limit:Infinity})
const displayData = Filter.filterData({allData, firstName, lastName, amount, amountIsRange, amountFrom, amountTo, page, limit:false}).map( function(i,index,thisArray) {
    let localSearch = Filter.findKey(i);
    let firstName = localSearch('first_name');
    let lastName = localSearch('last_name');
    let paymentAmount = i.total_amount_of_payment_usdollars;
    return (
            <motion.li key={index} initial={{opacity:0}} animate={{opacity:100}}>
                <ResultsRow number={index+page} firstName={firstName} lastName={lastName} paymentAmount={paymentAmount} index={index}/>
            </motion.li>
            );
    })
    return(
        <div className='resultsSection'>
            {'Rerenders: '+ (()=>counter.current++)()}
            <div className="infoRow">
                <p>{isSearching && 'Searching...' || !!allData.length && `Found ${allMatches.length.toLocaleString("en-US")} matches` || !isSearching && 'Enter a year or a range of years to begin your search 🔍'}</p>
            </div>
            <ul className='resultsBox'>
                {displayData}
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
                    className={ isSearching || !allData.length ? 'notClickable' : 'clickable' }
                    onClick={()=>isSearching || !allData.length ?  null : setPage(c=>c+15)}
                >
                    {allMatches.length-page >= 30 ? 'Next >' : 'Load More >'}
                </button>
                <button onClick={()=>{
                  allMatches.length ?  ExportController.handleExport(allMatches) : window.alert('No matches to export');
                }} className='exportBtn'>{`Export All Matches`}</button>
            </div>
        </div>  
    )
}

export default Results;