import { io } from "https://cdn.socket.io/4.5.0/socket.io.esm.min.js"
import { MEMBERS, updateMembersContents, saveProfileEdit, profileState } from "./sidebarscript.js";
import { authObj, updateAuth } from "./authorization.js";
import { appendMessage, appendBulkMessages, appendVerifiedMessage } from "./chatscript.js";
import { closeLoader } from "./utils.js";
import { updateUserDOMElements } from "./frameState.js";
import { updateMovieState } from "./videoscript.js";
import { drawInitReceive, onDrawUpdateReceived, onDrawVerified } from "./drawscript.js";

export const socketObj = {
  reconnects: 0,
  io: undefined,
  active: false
}


export function socketInit(){
  if (authObj.AUTHORIZED == false) {updateAuth(); return}
  const socket = io({reconnection: false});
  socketObj.io = socket

  socket.on("connect", userConnected);
  socket.on("ijoined", iJoined)
  
  socket.on("enter", userEntered)
  socket.on("exit", userExited)

  socket.on("messageGlobal", onMessageReceived)
  socket.on("messageVerified", messageVerified)

  socket.on("drawInitReceive", drawInitReceive)
  socket.on("drawPushGlobal", onDrawUpdateReceived)
  socket.on("drawVerified", onDrawVerified)
  
  socket.on("updateMovie", updateMovieState)


  
  socket.on("pushUpdate", socketUpdateMessage)
  socket.on("updateProfileStatus", updateProfileStatus)
  socket.on("profileUpdated", profileUpdated)
  
  socket.on("disconnect", () => {
    console.log("SOCKETIO: ❌")
    socketObj.active = false;
    // checkAuth();
    MEMBERS.length = 0
    authObj.AUTHORIZED = false;
    updateMembersContents()
    
    setTimeout(socketInit,1000);
  });

}

async function userConnected(){

  if (!socketObj.io.disconnected && authObj.AUTHORIZED ) {
    console.log(`SOCKETIO: ✅ (${socketObj.reconnects} reconnects)`)
    socketObj.reconnects += 1;
    socketObj.active      = true;
    
    authObj.sid = socketObj.io.id

    socketObj.io.emit("join", authObj.account.username);
  }
}

function iJoined({socketid, messagesCached}){
  if(authObj.sid != socketid){return;}
  const idx = MEMBERS.findIndex((x) => x.socketid == socketid )
  if (idx != -1){ console.log("socket id already exists"); return;}
  MEMBERS.push({socketid:socketid, username:authObj.account.username})
  updateMembersContents()
  appendBulkMessages(messagesCached)
}

async function userEntered({socketid, username}){
  console.log(socketid, `(${username}) joined`)
  MEMBERS.push({socketid:socketid, username:username})
  updateMembersContents()
}

async function userExited({socketid}){
  const idx = MEMBERS.findIndex((x) => x.socketid == socketid )
  console.log(socketid, `(${MEMBERS[idx].username}) left`)
  MEMBERS.splice(idx,1)
  updateMembersContents()
}

function onMessageReceived(data){
  appendMessage(data)
}

function messageVerified({messageid}){
  appendVerifiedMessage(messageid)
}

function socketUpdateMessage(data){
  console.log(data)
}

function updateProfileStatus(status){
  if(status == "ok"){
    saveProfileEdit()
    updateUserDOMElements()
    profileUpdated({sid: authObj.sid, uid:authObj.uid, username:profileState.username, pfp:profileState.pfp})
    closeLoader()
  }
}

function profileUpdated({sid, uid, username, pfp}){
  const idx = MEMBERS.findIndex((x) => x.socketid == sid )
  MEMBERS[idx].username = username
  MEMBERS[idx].pfp      = pfp
  updateMembersContents();
}