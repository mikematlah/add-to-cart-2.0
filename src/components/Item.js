import React from 'react'



export function Item(props){
    return(
        <li onClick={()=>{props.delete(props.id)}}>
            {props.text}
            
        </li>
    )
}
