import axios from 'axios';
import React, { useEffect } from 'react'

function NewResults({statePackage, dataNeedsRefresh, setDataNeedsRefresh}) {

    const { firstName, lastName, lookUpTable, setGlobalOffset } = statePackage;
    const { yearPackage, amountPackage } = statePackage;
    const [ yearRangeToggle, yearRange, exactYear ] = yearPackage;
    const [ amountRangeToggle, amountRange, exactAmount ] = amountPackage;

    const yearIsRange = yearRangeToggle[0];
    const [ yearFrom, yearTo ] = yearRange[0];
    const year = exactYear[0];

    const amountIsRange = amountRangeToggle[0];
    const [ amountFrom, amountTo ] = amountRange[0];
    const amount = exactAmount[0];

    useEffect(()=>{
        axios.post()
    },[firstName, lastName, amount. year])

  return (
    <div>
        
    </div>
  )
}

export default NewResults