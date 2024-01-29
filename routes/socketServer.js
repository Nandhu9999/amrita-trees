const data = require("../src/data.json");
const db = require("../src/" + data.database);

const connections = []
const messagesCache = []
const drawHistoryCache = []
function socketConnection(socket){
  // console.info('🟢 socket    connected:', socket.id.slice(0, 5));

  socket.on("join", async(username)=>{
    await db.addMember(socket.id, username)
    const userObj = {socketid: socket.id, username: username, lastTyped: 0}
    
    socket.broadcast.emit("enter", userObj);
    socket.emit("ijoined", {socketid:userObj.socketid, messagesCached: messagesCache});
    connections.push(userObj)
  })

  socket.on("disconnect", async(data) => {
    // console.log("⚫ socket disconnected:", socket.id.slice(0, 5));
    await db.deleteMember(socket.id)

    const idx = connections.findIndex((x) => x.socketid == socket.id )
    const userObj = connections[idx]
    
    socket.broadcast.emit("exit", userObj);
    connections.slice(idx, 1)
    
  })
  
  socket.on("messageServer", async(data)=>{
    // console.log("💬 received message:",socket.id.slice(0, 5));
    
    if(data.content.startsWith("/")){
      
    }

    messagesCache.push(data)
    while(messagesCache.length > 100) messagesCache.pop(0)

    // broadcast to all other users and itself
    socket.broadcast.emit("messageGlobal", data);
    socket.emit("messageVerified", {messageid: data.messageid});
  })
  
  socket.on("drawInit", async(data)=>{
    console.log("🧑‍🎨 new artist!");
    socket.emit("drawInitReceive", drawHistoryCache);
  })

  socket.on("draw", async(action)=>{
    console.log("🖌️ received draw message:",action.drawid);
    
    switch(action.type){
      case "clearcanvas":
        drawHistoryCache.length = 0
        break;

      default:
        drawHistoryCache.push(action)
        while(drawHistoryCache.length > 100) messagesCache.pop(0)
        break;   
    }
    
    // broadcast to all other users except sender
    socket.broadcast.emit("drawPushGlobal", action);
    socket.emit("drawVerified", {drawid: action.drawid, actionid: action.actionid});
  })

  socket.on("isTyping", async()=>{
    const idx = connections.findIndex((x) => x.socketid == socket.id )
    connections[idx].lastTyped = Date.now();
  });

}



module.exports = {
  socketConnection
}