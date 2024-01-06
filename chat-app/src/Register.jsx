import { useContext, useState } from "react";
import axios from "axios"
import {userContext} from './userContext'

export default function Register(){
    const [username,setUserName] =useState('');
    const [password,setPassword] =useState('');
    const [isLogin,SetIsLogin] = useState('register');
    const {setUserNameContext,setUserId} = useContext(userContext);

    async function register(ev){
        ev.preventDefault();
        if(username && password){
            await axios.post(`http://192.168.0.113:3000/${isLogin=='login' ? 'login':'register'}`,{username,password})
            .then((res)=>{
                setUserNameContext(res.data?.username);
                setUserId(res.data?.id);
            })
        }else{
            console.log('userNAme and Password required')
        }
        
    }
     

    return (
        <>
        <div className="bg-blue-50 h-screen flex items-center mb-12">
            <form className="w-64 mx-auto" onSubmit={register}>
                <input type="text" value={username} onChange ={ev=> setUserName(ev.target.value)} placeholder="username" className="border-spacing-1 block w-full p-2 mb-2"></input>
                <input type="password" value={password} onChange={ev=>setPassword(ev.target.value)} placeholder="type password" className="border-spacing-1 p-2 mb-2 block w-full"></input>
                <button className="px-4 bg-blue-500 text-white block w-full rounded-md ">{isLogin=== 'login' ? 'Login' : 'Register' }</button>
                <div className="text-center mt-2">{isLogin==='register'&& (
                    <div>
                        Already Member? <button onClick={()=>SetIsLogin('login')}>Log in</button>
                    </div>
                )}</div>
                <div className="text-center mt-2">{isLogin==='login'&& (
                    <div>
                        not have an Account? <button onClick={()=>SetIsLogin('register')}>Sign Up</button>
                    </div>
                )}</div>
            </form>
        </div>
        </>
    )
}