const data = require("../src/data.json");
const db = require("../src/" + data.database);

async function totalChannels(request, reply){
    // functions will be converted to string
    // only will be executed in the client side
    const home = function ()
    {defaultState();}
    const game = function ()
    {overlayState();setOverlayState('embed',{link:'https://scratch.mit.edu/projects/904596842/embed'})}
    const   tv = function ()
    {overlayState();setOverlayState('movie',{stream:'', captions:''})}
    const draw = function ()
    {overlayState();setOverlayState('draw' ,{})}

    const channels = [
        {label: "home", exec: home.toString()},
        // {label: "game", exec: game.toString()},
        {label: "t.v.", exec:   tv.toString()},
        {label: "draw", exec: draw.toString()},
    ]
    return reply.send(channels)
}

async function totalMembers(request, reply){
    const response = await db.getMembers()
    return reply.send(response)
}


async function editProfile(request, reply){
    const { sid, uid, username, pfp } = request.body;

    // if profile edit valid and safe
    // ...
    // ...

    this.io.to(sid).emit("updateProfileStatus", "ok")
    this.io.sockets.except( sid ).emit("profileUpdated", {sid, uid, username, pfp})
    return reply.send({ status: "ok" })
}


module.exports = {
    totalChannels,
    totalMembers,

    editProfile
}