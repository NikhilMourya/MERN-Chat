import { useContext } from "react";
import Register from "./Register";
import { userContext } from "./userContext";
import ChatView from "./ChatView";

export default function Routes(){
    const {username,userId} = useContext(userContext);
    if(username){
        console.log(username,userId)
        // return 'logged in '+username;
        return(
            <>
                <ChatView/>
            </>
        )
    }else{
        return(
            <>
            <Register/>
            </>
        )
    }
    
}