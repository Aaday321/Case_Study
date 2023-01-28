import React, {useEffect, useState} from 'react'


function ComplexSelector({name, selectorPackage, dataSetIds}) {

    const [ rangeToggle, range, exact ] = selectorPackage;

    const setRange = range[1];
    const setValidExactValue = exact[1];

    const [ rangeIsSelected, setRangeIsSelected ] = rangeToggle;
    const [ from, setFrom ] = useState("");
    const [ to, setTo ] = useState("");
    const [ exactValue, setExactValue ] = useState('');
    const [ msg, setMsg ] = useState("");

    const VALUES = {
        YEAR:{
            ID: 'Year',
            MIN_YEAR: Number(Object.keys(dataSetIds)[0]),
            MAX_YEAR: Number(Object.keys(dataSetIds)[Object.keys(dataSetIds).length-1]),
            RANGE_MSG: `Selection must be between ${Number(Object.keys(dataSetIds)[0])} and ${Number(Object.keys(dataSetIds)[Object.keys(dataSetIds).length-1])}`
        },
        MONEY:{
            ID: 'Amount',
            MIN_MONEY: 10,
            RANGE_MSG: 'Entry must be $10 or greater'
        }
    }

    useEffect(()=>setRange(c=>[validateRangeFromValue(), c[1]]),[from]);
    useEffect(()=>setRange(c=>[c[0], validateRangeToValue()]),[to]);
    useEffect(()=>setValidExactValue(validateExactValue()),[exactValue]);

    const minFrom = name===VALUES.YEAR.ID       ? VALUES.YEAR.MIN_YEAR     : VALUES.MONEY.MIN_MONEY;
    const maxFrom = name===VALUES.YEAR.ID       ? VALUES.YEAR.MAX_YEAR - 1 : Infinity;
    const minTo = name===VALUES.YEAR.ID         ? VALUES.YEAR.MIN_YEAR+1   : VALUES.MONEY.MIN_MONEY+0.01;
    const maxTo = name===VALUES.YEAR.ID         ? VALUES.YEAR.MAX_YEAR     : Infinity;
    const minExactValue = name===VALUES.YEAR.ID ? VALUES.YEAR.MIN_YEAR     : VALUES.MONEY.MIN_MONEY;
    const maxExactValue = name===VALUES.YEAR.ID ? VALUES.YEAR.MAX_YEAR     : Infinity;
    const rangeMsg  = name===VALUES.YEAR.ID     ? VALUES.YEAR.RANGE_MSG    : VALUES.MONEY.RANGE_MSG;

    const validateExactValue = () => {
        if(!exactValue) return;
        const numVal = Number(exactValue);
        let adjustedInput;

        //Compare to min and max values and adjusts accordingly
        if(numVal < minExactValue) adjustedInput = minExactValue;
        else if(numVal > maxExactValue) adjustedInput = maxExactValue;
        else adjustedInput = exactValue; //We make this equal to exactValue, which is a string so that later when doing filtering, we can filter with the decimal points like 10.00 which, when casted to a number would just be 10 therefor, when we slice the amount_data, 10.00 would match with 10.50 and it should not

        return adjustedInput;
    }

    const resetFields = () => {
        setFrom('');
        setTo('');
        setExactValue('');
    }

    const validateRangeFromValue = () => {
        if(!from) return;
        const numFrom = Number(from);
        const numTo = Number(to);
        let adjustedInput;

        //Compare to min and max values and adjusts accordingly
        if(numFrom < minFrom) adjustedInput = minFrom;
        else if(numFrom > maxFrom) adjustedInput = maxFrom;
        else adjustedInput = from;

        //Check to ensure that the "from" value is lower than the "to" value
        //If "From" is not lower, then make "to" -> "from" + 1
        if(numTo && adjustedInput >= numTo) setTo(Number(adjustedInput)+1);

        return adjustedInput;
    }

    const validateRangeToValue = () => {
        if(!to) return;
        const numFrom = Number(from);
        const numTo = Number(to);
        let adjustedInput;

        //Compare to min and max values and adjusts accordingly
        if(numTo < minTo) adjustedInput = minTo;
        else if(numTo > maxTo) adjustedInput = maxTo;
        else adjustedInput = to;

        //Check to ensure that the "to" value is higher than the "from" value
        //If "To" is not higher, then make "to" -> "from" + 1
        if(numFrom && numTo <= numFrom) adjustedInput = numFrom + 1;
        
        return adjustedInput;
    }

    const handleChange = (e, source) => {
        const newEntry = e.target.value;
        switch(source){
            case 'from': setFrom(newEntry); return;
            case 'to': setTo(newEntry); return;
            case 'exactValue': setExactValue(newEntry); return;
        }
    }


  return (
    <div className='complexInput'>
        <div className='topRow'>
            <div
                onClick={!rangeIsSelected ? ()=>{setRangeIsSelected(c=>!c); resetFields()} : null}
                className={rangeIsSelected ? 'topRowLeftSelected' : 'topRowLeft' }
            >
                Range
            </div>
            <div
                onClick={rangeIsSelected ? ()=>{setRangeIsSelected(c=>!c); resetFields()} : null}
                className={rangeIsSelected ? 'topRowRight' : 'topRowRightSelected'}
            >
                {name}
            </div>
        </div>
        { rangeIsSelected &&
        <div className="bottomRow">
            <input
                className='bottomRowLeft'
                placeholder='From'
                style={{textAlign:'center', paddingLeft:0}}
                type="number"
                onBlur={()=>setFrom(validateRangeFromValue())}
                onChange={e=>handleChange(e,'from')}
                value={from}
            />
            <input
                className='bottomRowRight'
                placeholder='To'
                style={{textAlign:'center', paddingLeft:0}}
                type="number"
                onBlur={()=>setTo(validateRangeToValue())}
                onChange={e=>handleChange(e, 'to')}
                value={to}
            />
        </div>
        ||
        <div className="bottomRow">
            <input
                placeholder={`Enter ${name.toLowerCase()}`}
                type="number"
                style={{textAlign:'center', paddingLeft:0}}
                onBlur={()=>setExactValue(validateExactValue())}
                onChange={e=>handleChange(e, 'exactValue')}
                value={exactValue}
            />
        </div>
        }
        <p className='quickErrMsg'>{msg}</p>
    </div>
  )
}

export default ComplexSelector