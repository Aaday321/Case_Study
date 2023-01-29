import React from 'react'

function DevPreview({statePackage}) {

    const { firstName, lastName, globalOffset } = statePackage;
    const { yearPackage, amountPackage } = statePackage;
    const [ yearRangeToggle, yearRange, exactYear ] = yearPackage;
    const [ amountRangeToggle, amountRange, exactAmount ] = amountPackage;

    const yearIsRange = yearRangeToggle[0];
    const [ yearFrom, yearTo ] = yearRange[0];
    const year = exactYear[0];

    const amountIsRange = amountRangeToggle[0];
    const [ amountFrom, amountTo ] = amountRange[0];
    const amount = exactAmount[0];


  return (
    <div className='previewSection'>
        <p><strong>First Name: </strong>{firstName}</p>
        <p><strong> Last Name: </strong>{lastName}</p>
        <br />
        <p><strong>Year Is Range: </strong>{yearIsRange && 'True' || 'False'}</p>
        {yearIsRange && <p><strong>Year From: </strong>{yearFrom}</p>}
        {yearIsRange && <p><strong>Year To: </strong>{yearTo}</p>}
        {yearIsRange || <p><strong>Exact Year: </strong>{year}</p>}
        <br />
        <p><strong>Amount Is Range: </strong>{amountIsRange && 'True' || 'False'}</p>
        {amountIsRange && <p><strong>Amount From: </strong>{amountFrom}</p>}
        {amountIsRange && <p><strong>Amount To: </strong>{amountTo}</p>}
        {amountIsRange || <p><strong>Exact Amount: </strong>{amount}</p>}
        <br />
        <p>Offset: {globalOffset.toLocaleString("en-US")}</p>
    </div>
  )
}

export default DevPreview