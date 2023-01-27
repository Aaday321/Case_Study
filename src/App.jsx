


import { useState, useEffect} from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import axios from 'axios'
import DropDown from './components/DropDown'
import ComplexSelector from './components/ComplexSelector'
import TopSection from './components/TopSection'
import Results from './components/Results'

function App() {

  const [ dataSetIds, setDataSetIds ] = useState({}); //Key value pairs of years and their ids
  const [ firstName, setFirstName ] = useState("");
  const [ lastName, setLastName ] = useState("");
  const yearRangeToggle = useState(false);
  const yearRange = useState(new Array(2));
  const exactYear = useState("");
  const amountRangeToggle = useState(false);
  const amountRange = useState(new Array(2));
  const exactAmount = useState("");
  const [ limits, setLimits ] = useState([]);

    const yearIsRange = yearRangeToggle[0];
    const [ yearFrom, yearTo ] = yearRange[0];
    const year = exactYear[0];

    const amountIsRange = amountRangeToggle[0];
    const [ amountFrom, amountTo ] = amountRange[0];
    const amount = exactAmount[0];

  const create_Key_Value_Pairs_Connecting_A_Year_To_Its_ID = responseData => {
    const GENERAL_PAYMENT_IDENTIFIER = 'd2d239e8-05e9-515d-978c-69b34af232da'; //This is the identifier of the the General Payment data
    responseData = responseData.filter(i=>i.theme[0].identifier == GENERAL_PAYMENT_IDENTIFIER); //Filter out just the General Payment data
    const years = responseData.map(i=>Number(i.title.split(' ')[0]));
    responseData = responseData.map(i=>i.identifier); // grab only the identifiers within that
    const lookUpTable = {};
    for(let i=0; i<responseData.length; i++) lookUpTable[years[i]] = responseData[i];
    return lookUpTable;
  }

  const statePackage = {
    firstName, setFirstName,
    lastName, setLastName,
    yearPackage:[
      yearRangeToggle,
      yearRange,
      exactYear
    ],
    amountPackage:[
      amountRangeToggle,
      amountRange,
      exactAmount,
    ],
    dataSetIds //Key value pairs of years and their ids
  }

  //get the latest datasets on initial load
  useEffect(()=>{axios.get('https://openpaymentsdata.cms.gov/api/1/metastore/schemas/dataset/items?show-reference-ids')
    .then(r=>setDataSetIds(create_Key_Value_Pairs_Connecting_A_Year_To_Its_ID(r.data)))},[]);

  //Testing
  //useEffect(()=>{console.log(dataSetIds)},[dataSetIds]);

  return(
    <>
      <TopSection statePackage={statePackage}/>
      <Results statePackage={statePackage}/>
    </>
  )

  return(
    <div className="tester">
    <ComplexSelector name='Year'/>
    <ComplexSelector name='Amount'/>
    </div>
  )
}

export default App
