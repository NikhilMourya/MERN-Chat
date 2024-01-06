import  axios  from "axios";
import { createContext, useEffect, useState } from "react"


export const userContext = createContext({})

export function UserContextProvider({children}){
    const [username,setUserNameContext] = useState(null);
    const [userId,setUserId] = useState(null);

    useEffect(()=>{
        console.log(document.cookie,'cookies')
        // debugger
        axios.get('http://192.168.0.113:3000/profile',{withCredentials:true}).then((res)=>{
        //    console.log(res.data);
           setUserId(res.data.userId)
           setUserNameContext(res.data.username)
        })
    })
    return (
        <userContext.Provider value={{username,setUserNameContext,userId,setUserId}}>
            {children}
        </userContext.Provider>
    )
}