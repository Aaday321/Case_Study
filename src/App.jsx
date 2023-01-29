


import { useState, useEffect} from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import axios from 'axios'
import DropDown from './components/DropDown'
import ComplexSelector from './components/ComplexSelector'
import TopSection from './components/TopSection'
import Results from './components/Results'
import DevPreview from './components/DevPreview'

function App() {
  const [ renderDevPreview, setRenderDevPreview ] = useState(false);
  
  const [ firstName, setFirstName ] = useState("");
  const [ lastName, setLastName ] = useState("");
  const yearRangeToggle = useState(false);
  const yearRange = useState(new Array(2));
  const exactYear = useState("");
  const amountRangeToggle = useState(false);
  const amountRange = useState(new Array(2));
  const exactAmount = useState("");

//  const [ allDataCount, setAllDataCount ] = useState(0);




  const [ lookUpTable, setLookUpTable ] = useState({}); //Key value pairs of years and their ids
  const [ dataNeedsRefresh, setDataNeedsRefresh ] = useState(false);
  const [ lastChecked, setLastChecked ] = useState(Date.now());
  const GENERAL_PAYMENT_IDENTIFIER = 'd2d239e8-05e9-515d-978c-69b34af232da';
  const MAIN_END_POINT = 'https://openpaymentsdata.cms.gov/api/1/metastore/schemas/dataset/items?show-reference-ids';

  const create_Key_Value_Pairs_Connecting_A_Year_To_Its_ID = responseData => { //This is the identifier of the the General Payment data
    const generalPayments = responseData.filter(i=>i.theme[0].identifier == GENERAL_PAYMENT_IDENTIFIER); //Filter to keep only the General Payment data
    const years = generalPayments.map(i=>Number(i.title.split(' ')[0])); //Grab the years from the General Payment Data
    const identifiers = generalPayments.map(i=>i.identifier); //Grab only the identifiers from the General Payment Data
    const table = {};
    for(let i=0; i<identifiers.length; i++) table[years[i]] = identifiers[i]; //Creates table that looks like: {"2015":"ID_STRING", "2016", "ID_STRING"}
    return table;
  }

  //get the latest datasets on initial load
  useEffect(()=>{axios.get(MAIN_END_POINT)
    .then(r=>setLookUpTable(create_Key_Value_Pairs_Connecting_A_Year_To_Its_ID(r.data)))},[]);

  //Checks if any data from any year has been modified
  useEffect(function(){    
    setInterval(async function(){
      let response = await axios.get(MAIN_END_POINT); 
      response = response.data.filter(i=>i.theme[0].identifier == GENERAL_PAYMENT_IDENTIFIER);
      for(let i of response) if(Date.parse(i['%modified']) > lastChecked)setDataNeedsRefresh(true);
      setLastChecked(Date.now())
    },1_000_000) //16.6 Minutes
  },[])


  

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
    lookUpTable, //Key value pairs of years and their ids
 //   allDataCount, setAllDataCount,
  }


 

  return(
    <div >
      <TopSection statePackage={statePackage}/>
      <button className='devBtn' onClick={()=>setRenderDevPreview(c=>!c)}>{renderDevPreview && 'Hide state preview' || 'Show state preview'}</button>
      {renderDevPreview && <DevPreview statePackage={statePackage}/>}
      <Results statePackage={statePackage} dataNeedsRefresh={dataNeedsRefresh} setDataNeedsRefresh={setDataNeedsRefresh}/>
    </div>
  )
}

export default App
