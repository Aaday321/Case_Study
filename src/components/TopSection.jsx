import React from 'react'
import ComplexSelector from './ComplexSelector'

function TopSection({statePackage}) {

    const { firstName, setFirstName, lastName, setLastName, lookUpTable } = statePackage;
    const { yearPackage, amountPackage } = statePackage;

    const SITE_TEXT = {
        TITLE: 'DOCTOR PAYMENT SEARCH',
        CREDIT: 'By Ade Ritchards'
    }
  return (
    <div className='topSection'>
        <div className="title">
            <h1>{SITE_TEXT.TITLE}</h1>
            <p className='siteCredit'>{SITE_TEXT.CREDIT}</p>
        </div>
    <div className='inputRow'>
        <input
            className='nameInput'
            type="text"
            placeholder='First Name'
            onChange={e=>setFirstName(e.target.value)}
            value={firstName}
        />
        <input
            className='nameInput'
            type="text"
            placeholder='Last Name'
            onChange={e=>setLastName(e.target.value)}
            value={lastName}
        />
        <div className="cSlectors">
        <ComplexSelector name='Year' selectorPackage={yearPackage} lookUpTable={lookUpTable}/>
        <ComplexSelector name='Amount' selectorPackage={amountPackage} lookUpTable={lookUpTable}/>
        </div>
    </div>
    </div>
  )
}

export default TopSection