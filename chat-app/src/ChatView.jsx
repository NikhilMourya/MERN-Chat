import { useContext, useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";
import { userContext } from "./userContext";

import { uniqBy } from "lodash";
// import * as axios  from "axios";
import axios, * as others from 'axios';

export default function ChatView() {
  const [wsConnection, setwsConnection] = useState(null);

  const [onlinePeps, setOnlinePeps] = useState({});
  const [selectedUserid, SetSelectedUserId] = useState("");
  const { username, userId } = useContext(userContext);
  const [msg, setMsg] = useState("");
  const divUndermsg = useRef();

  const [msgs, setMsgs] = useState([]);

  useEffect(() => {
    // const ws = new WebSocket("ws://192.168.0.113:3000");
    // setwsConnection(ws);
    // ws.addEventListener("message", handleMessage);
    coneectToWs()
  }, []);

  //this function prevent the client from being disconnet from sockets using recursion
  function coneectToWs(){
    const ws = new WebSocket("ws://192.168.0.113:3000");
    setwsConnection(ws);
    ws.addEventListener("message", handleMessage);
    ws.addEventListener("close",coneectToWs)
  }

  function showOnline(users) {
    const peopleUnique = {};
    users.forEach(({ id, userName }) => {
      peopleUnique[id] = userName;
    });
    setOnlinePeps(peopleUnique);
  }

  function handleMessage(e) {
    const msgData = JSON.parse(e.data);
    if (msgData.onLine) {
      showOnline(msgData.onLine);
    } else if ("text" in msgData) {
      // console.log(msgData,'recoeved msg')
      setMsgs((current) => [...current, { ...msgData,id:Date.now() }]);
    }
  }

  function selectContact(userId) {
    SetSelectedUserId(userId);
  }

  const excludeMyId = { ...onlinePeps };
  delete excludeMyId[userId];

  function sendMsg(ev) {
    ev.preventDefault();
    wsConnection.send(
      JSON.stringify({
        message: {
          text: msg,
          isMy: true,
          sender: userId,
          recipient: selectedUserid,
        },
      })
    );
    setMsg("");
    setMsgs((current) => [
      ...current,
      { text: msg, isMy: true, sender: userId, recipient: selectedUserid, id : Date.now() },
    ]);
   
  }

  useEffect(()=>{
    const div =  divUndermsg.current;
    if(div){
      div.scrollIntoView({behavior:'smooth'})
    }
   
  },[msgs])

  useEffect(()=>{
    if(selectedUserid){
      axios.get('http://192.168.0.113:3000/messages/'+selectedUserid)
      .then((res)=>{
        console.log(res,'msg response')
        setMsgs(res.data)
      })
    }
  
  },[selectedUserid])


  let messageWithoutDuplicates = uniqBy(msgs, "_id");
  console.log(messageWithoutDuplicates, "uniqu");

  return (
    <>
      <div className="flex h-dvh">
        <div className="bg-white-100 w-1/3 pt-4">
          <div className="text-blue-500 font-bold flex gap-2 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path
                fillRule="evenodd"
                d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.17l-2.755 4.133a.75.75 0 0 1-1.248 0l-2.755-4.133a.39.39 0 0 0-.297-.17 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97ZM6.75 8.25a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 0 1.5h-9a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H7.5Z"
                clipRule="evenodd"
              />
            </svg>
            MERN Chat
          </div>
          <div>Logged In as {username}</div>
          {Object.keys(excludeMyId).map((userId) => {
            return (
              <div
                key={userId}
                onClick={() => selectContact(userId)}
                className={
                  "pl-4 border-b border-gray-100 py-2 flex gap-2 items-center cursor-pointer " +
                  (userId === selectedUserid ? "bg-blue-50" : "")
                }
              >
                <Avatar username={excludeMyId[userId]} userId={userId} />
                <span>{excludeMyId[userId]}</span>
              </div>
            );
          })}
        </div>
        <div className="bg-blue-50 w-2/3 flex flex-col">
          <div className="flex-grow">
            {!selectedUserid && (
              <div className="flex items-center justify-center h-full text-gray-400">
                &larr; Invite a Person to Chat
              </div>
            )}
            {selectedUserid && (
              <>
                <div className="relative h-full">
                  <div className="container px-2 overflow-y-scroll absolute inset-0">
                    {messageWithoutDuplicates.map((msg) => {
                      return (
                        <div
                          className={
                            msg.sender === userId ? "text-right" : "text-left"
                          }
                        >
                          <div
                            className={
                              "p-2 my-2 rounded-md inline-block text-left " +
                              (msg.sender === userId
                                ? "bg-blue-300 text-white "
                                : "bg-white text-grey-300 ")
                            }
                          >
                            {msg.text}
                          </div>
                          <div ref={divUndermsg}></div>
                        </div>
                        
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
          {!!selectedUserid && (
            <form className="flex gap-2 p-2" onSubmit={sendMsg}>
              <input
                type="text"
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                className="bg-white border px-2 flex-grow rounded rounded-sm"
                placeholder="Type Your Message"
              />
              <button className="bg-blue-500 p-2 text-white" type="submit">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                  />
                </svg>
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
