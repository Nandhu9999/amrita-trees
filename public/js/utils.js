import { authObj } from "./authorization.js";
import { appendMessage } from "./chatscript.js";
import { drawObj } from "./drawscript.js";
import { updateMovieState } from "./videoscript.js";

window.mobileAndTabletCheck = function() {
  // console.log("FORCE MOBILE")
  // return true;
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
  };

export const tempPfp = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_v437iy1U9932C6L6Jzi8HBjgbzH4huC6rA&usqp=CAU"

export function randomUUID(n){
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < n) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

export function getTime(timestamp){
  const time = new Date(timestamp)  
  const hrs = time.getHours()%12 == 0 ? 12 : time.getHours()%12;
  let mins = time.getMinutes();
  mins = mins > 9 ? mins : "0" + mins;
  const suffix = time.getHours() >= 12 ? " PM" : " AM";
  return `${hrs}:${mins} ${suffix}`;
}

export function getTimePrefix(timestamp){
  if(timestamp == 0){return ""}
  
  const time = new Date(timestamp);
  const currenttime = Date.now();
  let prefix = "";
  if( currenttime - timestamp >  86400000 ){
    prefix = "Yesterday at";
    if( currenttime - timestamp >  86400000 * 2 ){
      return time.getDate()+"/"+(time.getMonth()+1)+"/"+time.getFullYear(); 
    }
  }
  else{
    prefix = "Today at";
  }
  
  const hrs = time.getHours()%12 == 0 ? 12 : time.getHours()%12;
  let mins = time.getMinutes();
  mins = mins > 9 ? mins : "0" + mins;
  const suffix = time.getHours() >= 12 ? " PM" : " AM";
  return `${prefix} ${hrs}:${mins} ${suffix}`; 
}

export async function showLoader(){
  $("#loaderContainer").classList.add("active")
}
export function closeLoader(){
  $("#loaderContainer").classList.remove("active")
}

$("#devCheck").addEventListener("click", async ()=>{
    console.log("dev checking..");
})

export function getScrollPercent(h) {
  var b = document.body,
      st = 'scrollTop',
      sh = 'scrollHeight';
  return ((h[st]||b[st]) / ((h[sh]||b[sh]) - h.clientHeight) * 100) || 100;
}

export function isValidImage(url) {
  return /^https?:\/\/.+\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
}
export function isValidName(name){
  if (!name) return false
  return true
}

export function distanceBetween({x1,y1, x2,y2}) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}
export function angleBetween ({x1,y1, x2,y2}) {
  return Math.atan2(x2 - x1, y2 - y1)
}
export function midPointBtw({x1,y1,x2,y2}) {
  return {
    x: x1 + (x2 - x1) / 2,
    y: y1 + (y2 - y1) / 2
  };
}
export function devCommand(command){

  if(command.endsWith("\n")){
    command = command.slice(0,-1)
  }
  const cmd = command.split(" ")
  if (cmd[0] == "/d"){
    console.log(drawObj)
    return true;
  }
  else if (cmd[0] == "/size"){
    console.log(cmd)
    drawObj.size = Number(cmd[1])
    console.log(drawObj)
    return true;
  }
  else if (cmd[0] == "/check"){
    console.log(authObj)
    return true;
  }
  else if(cmd[0] == "/stream"){
    updateMovieState(cmd[1],cmd[2])
    return false;
  }
  else if(cmd[0] == "/set"){
    
    const cmd2 = cmd[1].split("=")
    const cmdObj = cmd2.map(ele => ele.trim())
    const cmdKey = cmdObj[0]
    const cmdVal = cmdObj[1]
    
    switch (cmdKey){
        case "service":
            const url = cmdVal
            const orcaMsg = {
              uid       : '000',
              username  : "OrcaMini",
              messageid : `msgid${randomUUID(12)}`,
              timestamp : Date.now(),
              pfp       : "https://ollama.ai/public/ollama.png"
            }
            if(!url){
              appendMessage(Object.assign(orcaMsg,{content:"Invalid service url!"}),1)
            }
            if(url && url.endsWith("/")){
              authObj.other_service_url = url.slice(0,-1)
            }else if(url){
              authObj.other_service_url = url
            }
            
            appendMessage(Object.assign(orcaMsg,{content:"Successfully set service url to: \n" + authObj.other_service_url}),1)

            break;
        default:
            console.log("help")
            break    
    }
    $("#textarea").innerText = ""
    $("#textarea").focus()
    return true
  }
  else if(cmd[0] == "/gpt"){
    let text = ""
    const userMsg = {
        uid       : authObj.uid,
        username  : authObj.account.username,
        messageid : `msgid${randomUUID(12)}`,
        timestamp : Date.now(),
        pfp       : authObj.account.pfp
    }
    for(let i = 1; i < cmd.length; i++){text += " " + cmd[i]}
    text = text.slice(1)
    appendMessage(Object.assign(userMsg,{content: "[GPT] " + text}),1)
    executeLargeLanguageModel(text)
    $("#textarea").innerText = ""
    $("#textarea").focus()
    return true
  }
}
export function clamp(val, min, max) {
  return val > max ? max : val < min ? min : val;
}
export function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
    a: 255
  } : null;
}
export function reverseHex(val){
  const parts = val.split("")
  const r = parts[0] + parts[1];
  const g = parts[2] + parts[3];
  const b = parts[4] + parts[5];
  return b+g+r;
}

export const CanvasAPI = {
  defaulColor: "#aaaaaa",
  defaultSize: 0,
  stampImage: new Image(),

  clearCanvas(ctx){
    const {width, height} = ctx.canvas
    ctx.clearRect(0,0, width, height)
  },
  
  clearCanvasColor(ctx,color){
    const {width, height} = ctx.canvas
    ctx.rect(0,0,width,height);
    ctx.fillStyle = color;
    ctx.fill();
  },

  executePointLine({ctx,x1,y1,x2,y2},props,callbackFn){
    const dist = distanceBetween({x1,y1, x2,y2});
    const angle = angleBetween({x1,y1, x2,y2});
    const halfSize = props.size / 2;
    if(x1 == x2 && y1 == y2){
      callbackFn(ctx,x1 - halfSize,y1 - halfSize, props)
    }
    for (let i = 0; i < dist; i += halfSize / 2) {
      const x = x1 + (Math.sin(angle) * i) - halfSize
      const y = y1 + (Math.cos(angle) * i) - halfSize
      callbackFn(ctx,x,y, props)
    }
  },
  executePointCurveLine({ctx,x1,y1,x2,y2},props,callbackFn){
    let f,t,dx2,dy2;
    if (typeof f === 'undefined') f = 0.3;
    if (typeof t === 'undefined') t = 0.6;
    
    const dist = distanceBetween({x1,y1, x2,y2});
    const halfSize = props.size / 2;

    function gradient(a, b) {
      return (b.y - a.y) / (b.x - a.x);
    }
  
    var m = 0;
    var dx1 = 0;
    var dy1 = 0;
  
    var preP = { x: x1, y: y1 };
    var curP = { x: x2, y: y2 };
  
    m = gradient(preP, curP);
    dx2 = (curP.x - preP.x) * -f;
    dy2 = dx2 * m * t;
  
    for (let i = 0; i < dist; i += halfSize / 2) {
      var x = preP.x - dx1 + curP.x + dx2;
      var y = preP.y - dy1 + curP.y + dy2;
  
      callbackFn(ctx,x,y, props)
    }

  },
  erasePoint(ctx,x,y,props){
    const halfSize = props.size / 2
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = "#000000";
    ctx.beginPath();
    ctx.arc(x + halfSize, y + halfSize, halfSize, 0, Math.PI*2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  },
  // drawPoint(ctx,x,y,props){
  //   const size = props.size
  //   const halfSize = size/2
  //   ctx.save();
  //   ctx.translate(x, y);
  //   ctx.fillStyle = "red";
  //   ctx.fillRect(0, 0, size, size);
  //   ctx.globalCompositeOperation = 'source-in';
  //   ctx.drawImage(CanvasAPI.stampImage,0,0, size, size)
  //   ctx.restore();
  // },
  // erasePoint(ctx,x,y,props){
  //   const size = props.size
  //   const halfSize = props.size / 2
  //   for( var i = 0 ; i < Math.round( Math.PI * size ) ; i++ ){
  //     var angle = ( i / Math.round( Math.PI * size )) * 360;
  //     ctx.clearRect(x + halfSize,y + halfSize, Math.sin( angle * ( Math.PI / 180 )) * size , Math.cos( angle * ( Math.PI / 180 )) * size );
  //   }
  // },
  // drawPoint(ctx,x,y,props){
  //   const size = props.size
  //   const color = props.color;
  //   const halfSize = size/2
  //   ctx.fillStyle = color;
  //   ctx.beginPath();
  //   ctx.arc(x + halfSize, y + halfSize, size, 0, Math.PI*2);
  //   ctx.fill();
  // },
  drawPoint(ctx,x,y,props){
    const size = props.size
    const color = props.color
    const halfSize = props.size / 2
    for( var i = 0 ; i < Math.round( Math.PI * size ) ; i++ ){
      var angle = ( i / Math.round( Math.PI * size )) * 360;
      ctx.fillStyle = color
      ctx.fillRect(x + halfSize,y + halfSize, Math.sin( angle * ( Math.PI / 180 )) * size , Math.cos( angle * ( Math.PI / 180 )) * size );
      ctx.fill()
    }
  },
  fillPoint(ctx,x,y,color){
    //https://stackoverflow.com/a/2119892
    const newColor = "0xFF"+ reverseHex(color.split("#")[1].toUpperCase());
    floodFill(ctx,x,y,newColor, 50)
  }
}
CanvasAPI.stampImage.src = "https://cdn-icons-png.flaticon.com/512/0/14.png"



function getPixel(pixelData, x, y) {
  if (x < 0 || y < 0 || x >= pixelData.width || y >= pixelData.height) {
      return NaN;
  }
  var pixels = pixelData.data;
  var i = (y * pixelData.width + x) * 4;
  return ((pixels[i + 0] & 0xFF) << 24) |
         ((pixels[i + 1] & 0xFF) << 16) |
         ((pixels[i + 2] & 0xFF) <<  8) |
         ((pixels[i + 3] & 0xFF) <<  0);
}

function setPixel(pixelData, x, y, color) {
  var i = (y * pixelData.width + x) * 4;
  var pixels = pixelData.data;
  pixels[i + 0] = (color >>> 24) & 0xFF;
  pixels[i + 1] = (color >>> 16) & 0xFF;
  pixels[i + 2] = (color >>>  8) & 0xFF;
  pixels[i + 3] = (color >>>  0) & 0xFF;
}

function diff(c1, c2) {
  if (isNaN(c1) || isNaN(c2)) {
      return Infinity;
  }

  var dr = ((c1 >>> 24) & 0xFF) - ((c2 >>> 24) & 0xFF);
  var dg = ((c1 >>> 16) & 0xFF) - ((c2 >>> 16) & 0xFF);
  var db = ((c1 >>>  8) & 0xFF) - ((c2 >>>  8) & 0xFF);
  var da = ((c1 >>>  0) & 0xFF) - ((c2 >>>  0) & 0xFF);

  return dr*dr + dg*dg + db*db + da*da;
}

export function floodFill(context, x, y, replacementColor, delta) {
  var current, w, e, stack, color, cx, cy;
  const canvas = context.canvas;
  var pixelData = context.getImageData(0, 0, canvas.width, canvas.height);
  var done = [];
  for (var i = 0; i < canvas.width; i++) {
      done[i] = [];
  }

  var targetColor = getPixel(pixelData, x, y);
  delta *= delta;

  stack = [ [x, y] ];
  done[x][y] = true;
  while ((current = stack.pop())) {
      cx = current[0];
      cy = current[1];

      if (diff(getPixel(pixelData, cx, cy), targetColor) <= delta) {
          setPixel(pixelData, cx, cy, replacementColor);

          w = e = cx;
          while (w > 0 && diff(getPixel(pixelData, w - 1, cy), targetColor) <= delta) {
              --w;
              if (done[w][cy]) break;
              setPixel(pixelData, w, cy, replacementColor);
          }
          while (e < pixelData.width - 1 && diff(getPixel(pixelData, e + 1, cy), targetColor) <= delta) {
              ++e;
              if (done[e][cy]) break;
              setPixel(pixelData, e, cy, replacementColor);
          }

          for (cx = w; cx <= e; cx++) {
              if (cy > 0) {
                  color = getPixel(pixelData, cx, cy - 1);
                  if (diff(color, targetColor) <= delta) {
                      if (!done[cx][cy - 1]) {
                          stack.push([cx, cy - 1]);
                          done[cx][cy - 1] = true;
                      }
                  }
              }
              if (cy < canvas.height - 1) {
                  color = getPixel(pixelData, cx, cy + 1);
                  if (diff(color, targetColor) <= delta) {
                      if (!done[cx][cy + 1]) {
                          stack.push([cx, cy + 1]);
                          done[cx][cy + 1] = true;
                      }
                  }
              }
          }
      }
  }

  context.putImageData(pixelData, 0, 0, 0, 0, canvas.width, canvas.height);
}


async function executeLargeLanguageModel(prompt){
    const orcaMsg = {
        uid       : '000',
        username  : "OrcaMini",
        messageid : `msgid${randomUUID(12)}`,
        timestamp : Date.now(),
        pfp       : "https://ollama.ai/public/ollama.png"
    }
    if(!authObj.other_service_url){
        appendMessage(Object.assign(orcaMsg,{content:"Please connect to a service"}),1)
        return
    }
    let rresponse = {}
    try{
        // default: http://localhost:11434
        rresponse = await fetch("/api/llm", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body:JSON.stringify({
                "service":`${authObj.other_service_url}/api/generate`,
                "model": "orca-mini",
                "prompt": prompt || "Who are you?",
                "stream":false,
            })
        })
    }catch(err){
        appendMessage(Object.assign(orcaMsg,{content:"An error occurred!"}),1)
        return
    }

    // IF STREAMING TOKENS
    const STREAM_TOKENS = false
    if (STREAM_TOKENS == true){
      const response = await rresponse.text();
      const resArray = JSON.parse("[" + ((response.split("\n")).join(",")).slice(0,-1) + "]")
      let msgContent = ""
      resArray.forEach(({response}) => {msgContent += response});
      console.log(msgContent)
      appendMessage(Object.assign(orcaMsg,{content:msgContent}),1)
    }else{
      const response = await rresponse.json();
      console.log(response)
      const msgContent = response["response"]
      appendMessage(Object.assign(orcaMsg,{content:msgContent}),1)
    }


}

async function debugConsole(a){
  await fetch("/api/debug", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body:JSON.stringify({"response":a})
  })
}