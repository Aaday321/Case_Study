import React, {useState, useEffect} from 'react'

function DropDown({dropDownItems, dropDownName}) {

    const [ clicked, setClicked ] = useState(false);
    const [ selectedItem, setSelectedItem ] = useState("");

  return (
    <div>
        <button onClick={()=>setClicked(current=>!current)}>{selectedItem || dropDownName}</button>
        <div style={{display: clicked ? 'block' : 'none'}}>
            <ul>
            {dropDownItems.map((i)=>
            <li>
            <button onClick={()=>{setSelectedItem(i); setClicked(false)}}>{i}</button>
            </li>
            )}
            </ul>
        </div>
    </div>
  )
}

export default DropDown