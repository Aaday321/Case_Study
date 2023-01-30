import axios from "axios";
import React, { useEffect, useState } from "react";

function NewResults({ statePackage, dataNeedsRefresh, setDataNeedsRefresh }) {
  const { firstName, lastName, lookUpTable, setGlobalOffset } = statePackage;
  const { yearPackage, amountPackage } = statePackage;
  const [yearRangeToggle, yearRange, exactYear] = yearPackage;
  const [amountRangeToggle, amountRange, exactAmount] = amountPackage;

  const yearIsRange = yearRangeToggle[0];
  const [yearFrom, yearTo] = yearRange[0];
  const year = exactYear[0];

  const amountIsRange = amountRangeToggle[0];
  const [amountFrom, amountTo] = amountRange[0];
  const amount = exactAmount[0];


  const [disToScreen, setDisToScreen] = useState([])

  useEffect(() => {
    if (!firstName) return;
    let fnKey;
    let lnKey;
    if (year == 2015) {
      fnKey = "physician_first_name";
      lnKey = "physician_last_name";
    } else {
      fnKey = "covered_recipient_first_name";
      lnKey = "covered_recipient_last_name";
    }
    axios
      .post(
        `https://openpaymentsdata.cms.gov/api/1/datastore/query/${lookUpTable[year]}/0`,
        {
          conditions: [
            {
              resource: "t",
              property: fnKey,
              value: firstName,
              operator: "starts with",
            },
          ],
          limit: 15,
        },
        {
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        setDisToScreen(response.data.results);
      })
      .catch((error) => {
        // Handle error
      });
  }, [firstName, lastName, amount]);

  return <div>
    {disToScreen.map(i=>{
       let fnKey;
       let lnKey;
       if (year == 2015) {
         fnKey = "physician_first_name";
         lnKey = "physician_last_name";
       } else {
         fnKey = "covered_recipient_first_name";
         lnKey = "covered_recipient_last_name";
       }
      return <p key={i.record_id} style={{color:"black"}}>{i[fnKey]}</p>
    })}
  </div>;
}

export default NewResults;
