import { useState } from 'react'
// import Register from './Register'
import axios from "axios"
import {UserContextProvider} from './userContext'
import Routes from './Routes'
// import './App.css'

function App() {
  // axios.default.baseURL = 'http://192.168.0.113:3000/';
  // axios.default.withCredentials = true;
  axios.defaults.withCredentials = true

  return (
    <>
      {/* <div className='bg-red-500'>tesst</div> */}
      <UserContextProvider>
        {/* <Register/> */}
        <Routes/>
      </UserContextProvider>
    </>
  )
}

export default App
