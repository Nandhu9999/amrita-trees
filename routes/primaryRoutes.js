const data = require("../src/data.json");
const db = require("../src/" + data.database);

const seo = require("../src/seo.json");
if (seo.url === "glitch-default") { seo.url = `https://${process.env.PROJECT_DOMAIN}.glitch.me`; }

function authorizeRequest(request, reply, next){

    const URL = request.url
    const ISAUTH = request.session.isAuthenticated

    /* 
     *  All Unauthorized and 
     *  /api prefixed urls
     *  NOT ALLOWED except
     *  some valid urls
     */
    
    if( ISAUTH === undefined && URL.startsWith("/api/")){
        console.log(request.url)

        const VALID_URLS = ["/api/authenticate", "/api/healthz"]
        if(VALID_URLS.indexOf(URL) == -1){
            return reply.send({status: "error", reason: "not authorized" })
        }
    }
    
    next()
}

// // //
// // //
// // //

async function checkAuthorized(request, reply){
    console.log("checking authorization")
    return reply.send({ status: "ok" })
}

async function home(request, reply) {
    return reply.view("/src/pages/index.hbs", {seo: seo});
};

async function authenticate(request, reply) {
    const { password } = request.body;
    const ADMIN_KEY = process.env.ADMIN_KEY || "abc123"
    if (password == ADMIN_KEY) {
        request.session.isAuthenticated = true;
        return reply.send({ status: "ok" });
    }
    return reply.send({ status: "error" });
};

async function logout(request, reply){
    if(request.session.isAuthenticated){
        request.session.destroy();
        return reply.redirect("/");
    }else{
        return reply.type("json").send({error:"user not found to logout"});
    }
}

module.exports = {
    home,
    authenticate,
    logout,
    authorizeRequest,
    checkAuthorized,
}