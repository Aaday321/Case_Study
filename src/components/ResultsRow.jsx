import React from 'react'

function ResultsRow({firstName, lastName, paymentAmount, index, number}) {

    let backgroundColor;
    if(index%2) backgroundColor = '#D9D9D9'
    else backgroundColor = '#E9E9E9'

    const formatName = function(name){
        let newName = '';
        for (let i = 0; i < name.length; i++) {
        newName+=(i === 0 ? name[i].toUpperCase() : name[i].toLowerCase())
        }
        return newName
    }

    const handleName = function(firsname, lastname){
        if(firsname) firsname = formatName(firsname);
        if(lastname) lastname = formatName(lastname);
        if(!firsname && lastname) return lastname;
        else if(firsname && !lastname) return firsname;
        else if(!firsname && !lastname) return 'UNLISTED';
        else return firsname + ' ' + lastname;
    }

  return (
    <div className='resultRow' style={{backgroundColor}}>
        <p>{number+1}</p>
        <div className="name">
            <p>{handleName(firstName, lastName)}</p>
        </div>
        <div className="split"></div>
        <p className='price'>{'$'}{paymentAmount}</p>
    </div>
  )
}

export default ResultsRow