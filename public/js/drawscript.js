import { authObj } from "./authorization.js";
import { socketObj } from "./socketClient.js";
import { randomUUID, clamp, CanvasAPI } from "./utils.js";

import ReinventedColorWheel from "../module/reinvented-color-wheel.js";

export const drawObj = {
    selected: "brush",
    CANVAS: null,
    color: "#323232",
    size: 15,
    totalTouchActives: 0,
    clickActive: false,
    lastKnwnPoint: {x:0,y:0},
    layerMapping:{},

    myActions: [],

    scale: 1,

    worldX: 0,
    worldY: 0,

    screenX: 0,
    screenY: 0,
    
    offsetX: 0,
    offsetY: 0,

    startPanX: 0,
    startPanY: 0,

    changeSize: function(val){
        this.size = val
        if (this.size > DesktopCanvas.sizeMax) {
            this.size = DesktopCanvas.sizeMax 
        } 
        else if(this.size < DesktopCanvas.sizeMin) {
            this.size = DesktopCanvas.sizeMin 
        }
        const canvas = $(".brushSizeViewer")
        if( canvas ){
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0,0,canvas.width, canvas.height)
            ctx.strokeStyle = "grey";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, this.size / 2, 0, Math.PI*2);
            ctx.stroke();
        }
    },
    setTool: function(tool){
        switch(tool){
            case "brush":
                this.selected = "brush"
                break;
            case "erase":
                this.selected = "erase"
                break;
            case "pan&zoom":
                this.selected = "pan&zoom"
                break;
            case "bucket":
                this.selected = "bucket"
                break;
        }
    }
}
const closeDrawBtn = $("#drawModal .closeDrawModal")
closeDrawBtn.addEventListener("click", closeDrawModal)
export function closeDrawModal(){
    $("#drawModal .contents").innerHTML = ""
    $("#drawModal").classList.add("hide")
    $("#drawModal").close();
}
export function clearcanvasTool(){
    console.log("clear canvas")
    drawObj.CANVAS.clearCanvasAction(-1);
}
export function settingsTool(){
    console.log("settings")
}
export function undoTool(){
    console.log("undo")
    drawObj.CANVAS.undoAction();
}
export function redoTool(){
    console.log("redo")
}
export function panzoomTool(){
    console.log("panzoom")
    if(drawObj.selected == "pan&zoom"){
        drawObj.scale = 1
        drawObj.offsetX = 0
        drawObj.offsetY = 0
        drawObj.CANVAS.updatePanZoom();
    }
    drawObj.selected = "pan&zoom"
}
export function brushTool(){
    if(drawObj.selected != "brush"){
        drawObj.selected = "brush"
        return
    }
    // open draw modal
    $("#drawModal").classList.remove("hide")
    $("#drawModal").showModal();
    $("#drawModal .contents").innerHTML = ""

    const sizeSelection = document.createElement("div");
    const brushSelection = document.createElement("div");


    const div1 = document.createElement("div");
    const div2 = document.createElement("div");
    div1.style.display = "grid";
    div1.style.placeItems = "center";
    const input1 = document.createElement("input");
    input1.type = "range"
    input1.min = CanvasPlatform.sizeMin
    input1.max = CanvasPlatform.sizeMax
    input1.value = drawObj.size
    input1.oninput = (e)=>{drawObj.changeSize(e.target.value)}
    div1.appendChild(input1)
    
    const canvas1 = document.createElement("canvas")
    canvas1.classList = "brushSizeViewer"
    canvas1.width = CanvasPlatform.sizeMax + 2
    canvas1.height = CanvasPlatform.sizeMax + 2
    div2.appendChild(canvas1)

    sizeSelection.appendChild(div1)
    sizeSelection.appendChild(div2)

    sizeSelection.classList = "sizeSelection"
    Object.assign(sizeSelection.style,{
        display:"grid",
        gap:"20px",
        justifyContent:"center",
        gridTemplateColumns:`auto ${CanvasPlatform.sizeMax + 2}px`,
        height:`${CanvasPlatform.sizeMax + 2}px`,
        width:"100%"
    })

    $("#drawModal .contents").appendChild(sizeSelection);
    $("#drawModal .contents").appendChild(brushSelection);
    drawObj.changeSize(drawObj.size)
}
export function eraseTool(){
    console.log("erase")
    drawObj.selected = "erase"
}
export function paletteTool(){
    console.log("palette")
    $("#drawModal").classList.remove("hide")
    $("#drawModal").showModal();
    
    $("#drawModal .contents").innerHTML = ""

    switch("colorwheel"){
        case "colorwheel":
            const colorWheel = new ReinventedColorWheel({
                // appendTo is the only required property. specify the parent element of the color wheel.
                appendTo: $("#drawModal .contents"),
                
                // followings are optional properties and their default values.
        
                // initial color (can be specified in hsv / hsl / rgb / hex)
                // hsv: [0, 100, 100],
                // hsl: [0, 100, 50],
                // rgb: [32, 32, 32],
                hex: drawObj.color,
                
                // appearance
                wheelDiameter: 200,
                wheelThickness: 20,
                handleDiameter: 16,
                wheelReflectsSaturation: false,
                
                // handler
                onChange: function (color) {
                    // the only argument is the ReinventedColorWheel instance itself.
                    // console.log("hsv:", color.hsv[0], color.hsv[1], color.hsv[2]);
                    drawObj.color = color.hex
                },
            });
            colorWheel
            break;
        case "256colors":
            const colors = ["#000000", "#111000", "#222000", "#333000", "#444000", "#555000", "#666000", "#777000", "#888000", "#999000", "#aaa000", "#bbb000", "#ccc000", "#ddd000", "#eee000", "#fff000"]
            const colorpalette = document.createElement("div")
            colorpalette.classList = "colorpalette"
            colors.forEach((color)=>{
                const div = document.createElement("div")
                div.style.background = color;
                div.classList = "colorpaletteOption"
                div.onclick = ()=>{
                    drawObj.color = color;
                    const opt = $(".colorpaletteOption.selected")
                    if(opt) opt.classList.remove("selected");
                    div.classList.add("selected")
                }
                colorpalette.appendChild(div)
            })
            $("#drawModal .contents").appendChild(colorpalette)
            break;
    }
    
}
export function colorpickerTool(){
    console.log("color picker")
}
export function bucketTool(){
    console.log("bucket")
    drawObj.selected = "bucket"
}
export function layersTool(){
    console.log("layers")
}
export function setBaseCanvas(canvas, canvasContainer){
    if(window.mobileAndTabletCheck()){
        drawObj.CANVAS = new MobileCanvas(canvas, canvasContainer) 
    }else{
        drawObj.CANVAS = new DesktopCanvas(canvas, canvasContainer)
    }
}

class CanvasPlatform{
    static sizeMax = 70;
    static sizeMin = 5;

    static zoomSpeed = 0.012;
    static zoomMax = 3;
    static zoomMin = 0.5;

    static panMax = 300;
    static panMin = -300;

    constructor(canvas,canvasContainer){
        this.canvas          = canvas
        this.canvasContainer = canvasContainer
        const rect0          = canvasContainer.getBoundingClientRect();
        this.canvasContainer.width = rect0.width
        this.canvasContainer.height = rect0.height

        // const dpr          = window.devicePixelRatio;
        const rect1         = canvas.getBoundingClientRect();
        this.canvas.width  = rect1.width * (1 || dpr);
        this.canvas.height = rect1.height * (1 || dpr);
        
        this.CONTEXTS        = []
        this.CONTEXTS.push( this.createLayer("layer 0") )
        drawObj.layerMapping[authObj.uid] = 0

        this.canvas.addEventListener('contextmenu', e=>{e.preventDefault();});
        this.DRAWHISTORY        = [];
        this.currentState   = -1;
        // {type:'brush', color, size, points:[{x,y},{x,y},{x,y},{x,y}...]}
        // {type:'erase', points:[{x,y},{x,y},{x,y},{x,y}...]}
        // {type:'fill',  color, x, y }
        // {type:''}
    }
    createLayer(name){
        const newlayer = this.canvas.cloneNode()
        newlayer.classList = name
        newlayer.id = "c" + randomUUID(6)
        newlayer.width = this.canvas.width
        newlayer.height = this.canvas.height
        $("#canvasContainer").prepend(newlayer)
        // return newlayer.getContext("2d")
        const ctx = newlayer.getContext("2d",{ alpha: true })

            // ctx.rect(0,0,ctx.canvas.width, ctx.canvas.height)
            // ctx.fillStyle = "#ffffff";
            // ctx.fill()
            newlayer.style.background = "#ffffff"

        ctx.imageSmoothingEnabled = false;
        return ctx
    }
    getPointerPos({clientX, clientY}) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (clientX - rect.left) / (rect.right - rect.left) * this.canvas.width,
            y: (clientY - rect.top) / (rect.bottom - rect.top) * this.canvas.height
        };
    }
    clearCanvas(ctxId = -1){
        if(ctxId == -1){
            this.CONTEXTS.forEach((context)=>{CanvasAPI.clearCanvasColor(context, "#ffffff")})
        }
    }
    drawQuadraticLine({x1,y1,x2,y2, color=drawObj.color, size=drawObj.size},ctxId=0){
        const ctx = this.CONTEXTS[ctxId]
        if(!ctx){console.error("no context available");return;}

        CanvasAPI.executePointLine({ctx,x1,y1,x2,y2},{color,size},CanvasAPI.drawPoint)
    }
    eraseQuadraticLine({x1,y1,x2,y2, size=drawObj.size},ctxId=0){
        const ctx = this.CONTEXTS[ctxId]
        if(!ctx){console.error("no context available");return;}
        
        CanvasAPI.executePointLine({ctx,x1,y1,x2,y2},{size},CanvasAPI.erasePoint)
        // const dist = distanceBetween({x1,y1, x2,y2});
        // const angle = angleBetween({x1,y1, x2,y2});
        // const halfSizeOfBrush = size / 2;

        // for (let i = 0; i < dist; i += halfSizeOfBrush / 2) {
        //     const x = x1 + (Math.sin(angle) * i) - halfSizeOfBrush
        //     const y = y1 + (Math.cos(angle) * i) - halfSizeOfBrush
        //     this.erasePoint({x, y, size:halfSizeOfBrush},ctxId);
        // }
    }
    erasePoint({x,y, size},ctxId=0){
        const ctx = this.CONTEXTS[ctxId]
        if(!ctx){console.error("no context available");return;}

        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = "#000";
        ctx.beginPath();
        ctx.arc(x + size, y + size, size, 0, Math.PI*2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';

    }
    fillPoint({x,y,color},ctxId=0){
        const ctx = this.CONTEXTS[ctxId]
        if(!ctx){console.error("no context available");return;}

        CanvasAPI.fillPoint(ctx,x,y,color)

    }
    applyAction2Canvas(action){
        switch(action.type){
            case "brush":
                if(action.points.length == 1){
                    action.points.push(action.points[0])
                }
                for(let i = 1; i < action.points.length; i++){
                    const prevpoint = action.points[i-1]
                    const point = action.points[i]
                    this.drawQuadraticLine({x1:prevpoint.x, y1:prevpoint.y,
                        x2:point.x,y2:point.y,
                        color:action.color,size:action.size, 
                    },drawObj.layerMapping[action.uid])
                }
                break;

            case "erase":
                for(let i = 1; i < action.points.length; i++){
                    const prevpoint = action.points[i-1]
                    const point = action.points[i]
                    this.eraseQuadraticLine({x1:prevpoint.x, y1:prevpoint.y,
                        x2:point.x,y2:point.y,
                        size:action.size, 
                    })
                }
                break;
            case "bucket":
                this.fillPoint(action)
                break;
            case "clearcanvas":
                this.clearCanvas(action.ctxId)
        }
        this.DRAWHISTORY.push(action);
        this.currentState++;
    }
    // Requirements
    // - Must work for multiple layers
    // - Should affect all users
    // - Memory efficient
    undoAction(){
        //

    }
    redoAction(){
        //

    }

    updatePanZoom(scale=drawObj.scale,offsetX=drawObj.offsetX, offsetY=drawObj.offsetY){
        console.log("updating..", scale, offsetX, offsetY)
        scale = clamp(scale,CanvasPlatform.zoomMin, CanvasPlatform.zoomMax )
        drawObj.scale = scale

        function changeCSS(ele){
            ele.style.transform = `scale(${scale}) translate(${-offsetX / scale}px, ${-offsetY / scale}px)`;
        }

        changeCSS(this.canvas);
        this.CONTEXTS.forEach((context)=>{changeCSS(context.canvas);})
    }


}
class SocketPlatform extends CanvasPlatform{

    constructor(canvas,canvasContainer){
        super(canvas,canvasContainer)
        this.action = {}
        
        this.recordRate = 10;
        this.lastRecorded = Date.now();

        socketObj.io.emit("drawInit", authObj.uid);
    }
    resetActionObj(){
        this.action = {
            actionid:"",
            uid:authObj.uid,
            mode: window.mobileAndTabletCheck() ? "mobile" : "desktop",
            type:"",
            color:"",
            size:-1,
            points:[],
            x:-1,
            y:-1,
        }
    }
    
    fromServer(action){
        this.applyAction2Canvas(action);
    }
    pushServer(action){
        if(action.uid == authObj.uid){
            socketObj.io.emit("draw", Object.assign(action,{drawid:randomUUID(8)}))
            drawObj.myActions.push(action)
            this.DRAWHISTORY.push(action)
            this.currentState++;
        }
    }

    clearCanvasAction(ctxId){
        this.resetActionObj()
        this.action.actionid = randomUUID(8)
        this.action.type = "clearcanvas"
        this.action.ctxId = ctxId
        this.pushServer(this.action)
    }

}
class DesktopCanvas extends SocketPlatform{

    constructor(canvas,canvasContainer){
        super(canvas,canvasContainer)
        this.createEvents()
    }
    createEvents(){
        this.canvasContainer.addEventListener("pointerdown", this.onPointerDown.bind(this), true)
        this.canvasContainer.addEventListener("pointermove", this.onPointerMove.bind(this), true)
        this.canvasContainer.addEventListener("pointerup",   this.onPointerUp.bind(this),   true)
        this.canvasContainer.addEventListener("pointerleave",this.onPointerLeave.bind(this))

        this.canvasContainer.addEventListener("wheel",       this.onWheel.bind(this))
        this.canvasContainer.addEventListener("keydown",     this.onKeyDown.bind(this))
    }
    onPointerDown({clientX, clientY, which, target}){
        if (which != 1||target.classList.contains("toolsArrWrapper")||target.classList.contains("noSelect")) return

        drawObj.clickActive = true
        this.resetActionObj()
        const {x,y} = this.getPointerPos({clientX,clientY})
        drawObj.lastKnwnPoint = {x,y}
        switch(drawObj.selected){
            case "brush":
                this.action.actionid = randomUUID(8)
                this.action.type = "brush";
                this.action.color = drawObj.color;
                this.action.size = drawObj.size;
                this.action.points = [{x,y}]
                
                this.drawQuadraticLine({x1:drawObj.lastKnwnPoint.x,y1:drawObj.lastKnwnPoint.y,x2:x,y2:y},drawObj.layerMapping[authObj.uid]);
                break;
            case "erase":
                this.action.actionid = randomUUID(8)
                this.action.type = "erase"
                this.action.size = drawObj.size;
                this.action.points = [{x,y}]

                this.eraseQuadraticLine({x1:drawObj.lastKnwnPoint.x,y1:drawObj.lastKnwnPoint.y, x2:x, y2:y}, drawObj.layerMapping[authObj.uid]);
                break;
            case "bucket":
                this.action.actionid = randomUUID(8)
                this.action.type = "bucket",
                this.action.color = drawObj.color
                this.action.x = x
                this.action.y = y
                this.fillPoint({x,y,color:drawObj.color},drawObj.layerMapping[authObj.uid]);
                break;
            case "pan&zoom":
                break;
        }
    }
    onPointerMove({clientX,clientY}){
        if(!drawObj.clickActive) return
        if(Date.now() - this.lastRecorded < this.recordRate){return}
        this.lastRecorded = Date.now();

        const {x,y} = this.getPointerPos({clientX,clientY})

        switch(drawObj.selected){
            case "brush":
                this.action.points.push({x,y})
                this.drawQuadraticLine({x1:drawObj.lastKnwnPoint.x,y1:drawObj.lastKnwnPoint.y,x2:x,y2:y},drawObj.layerMapping[authObj.uid]);
                break;
            case "erase":
                this.action.points.push({x,y})
                this.eraseQuadraticLine({x1:drawObj.lastKnwnPoint.x,y1:drawObj.lastKnwnPoint.y,x2:x,y2:y},drawObj.layerMapping[authObj.uid]);
                break;
            case "pan&zoom":
                break;
        }
        // Save current x,y to known point for
        // connection between next position
        drawObj.lastKnwnPoint = {x,y}
    }
    onPointerUp(){
        drawObj.clickActive = false
        if(this.action.actionid) this.pushServer(this.action)
        this.resetActionObj()
    }
    onPointerLeave(){
        drawObj.clickActive = false
        if(this.action.actionid) this.pushServer(this.action)
        this.resetActionObj()
    }
    onWheel({deltaY, clientX, clientY, ctrlKey}){
        if(deltaY == 0 || ctrlKey) return;
        const direction = deltaY > 0 ? false : true;

        switch(drawObj.selected){
            case "brush":
            case "erase":
                if(drawObj.clickActive){break}
                if (direction) { drawObj.changeSize(drawObj.size + 2) }
                else { drawObj.changeSize(drawObj.size - 2) }
                
                break;
            case "pan&zoom":
                break;
        }

    }
    onKeyDown(){

    }
}
class MobileCanvas extends SocketPlatform{
    constructor(canvas,canvasContainer){
        super(canvas,canvasContainer)
        this.createEvents()
    }
    createEvents(){
        console.log("events created")
        this.canvasContainer.addEventListener("touchstart",  this.onTouchStart.bind(this), true)
        this.canvasContainer.addEventListener("touchmove",   this.onTouchMove.bind(this),  true)
        this.canvasContainer.addEventListener("touchend",    this.onTouchEnd.bind(this),   true)
        this.canvasContainer.addEventListener("touchcancel", this.onTouchCancel.bind(this))
    }

    onTouchStart({touches}){
        
        const target = touches[0].target;
        if(target.classList.contains("toolsArrWrapper")||target.classList.contains("noSelect")) return;
        drawObj.totalTouchActives = touches.length
        console.log(touches)

        const {clientX, clientY} = touches[0] // FIRST TOUCH PROPS
        const {x,y} = this.getPointerPos({clientX,clientY})
        if(drawObj.totalTouchActives == 2){
            console.log("pan&zoom")
            return
        }
        if(drawObj.totalTouchActives == 3){
            console.log("three fingers active")
            return
        }
        switch(drawObj.selected){
            case "brush":
                if (drawObj.totalTouchActives != 1) break;
                // [ONLY] if there is only 1 finger active
                drawObj.lastKnwnPoint = {x,y}
                this.action.actionid = randomUUID(8)
                this.action.type = "brush";
                this.action.color = drawObj.color;
                this.action.size = drawObj.size;
                this.action.points = [{x,y}]
                
                this.drawQuadraticLine({x1:drawObj.lastKnwnPoint.x,y1:drawObj.lastKnwnPoint.y,x2:x,y2:y},drawObj.layerMapping[authObj.uid]);
                break;
            case "erase":
                if (drawObj.totalTouchActives != 1) break;
                // [ONLY] if there is only 1 finger active
                drawObj.lastKnwnPoint = {x,y}
                this.action.actionid = randomUUID(8)
                this.action.type = "erase"
                this.action.size = drawObj.size;
                this.action.points = [{x,y}]

                this.eraseQuadraticLine({x1:drawObj.lastKnwnPoint.x,y1:drawObj.lastKnwnPoint.y, x2:x, y2:y}, drawObj.layerMapping[authObj.uid]);
                break;
            case "bucket":
                if (drawObj.totalTouchActives != 1) break;
                // [ONLY] if there is only 1 finger active
                drawObj.lastKnwnPoint = {x,y}
                this.action.actionid = randomUUID(8)
                this.action.type = "bucket",
                this.action.color = drawObj.color
                this.action.x = x
                this.action.y = y
                this.fillPoint({x,y,color:drawObj.color},drawObj.layerMapping[authObj.uid]);
                break;
            case "pan&zoom":
                console.log("only panning possible")
                break;
        }

    }
    onTouchMove({touches}){
        // console.log(e)
        if(Date.now() - this.lastRecorded < this.recordRate){return}
        this.lastRecorded = Date.now();

        const {clientX, clientY} = touches[0] // FIRST TOUCH PROPS
        const {x,y} = this.getPointerPos({clientX,clientY})

        switch(drawObj.selected){
            case "brush":
                this.action.points.push({x,y})
                this.drawQuadraticLine({x1:drawObj.lastKnwnPoint.x,y1:drawObj.lastKnwnPoint.y,x2:x,y2:y},drawObj.layerMapping[authObj.uid]);
                break;
            case "erase":
                this.action.points.push({x,y})
                this.eraseQuadraticLine({x1:drawObj.lastKnwnPoint.x,y1:drawObj.lastKnwnPoint.y,x2:x,y2:y},drawObj.layerMapping[authObj.uid]);
                break;
            case "pan&zoom":
                // should be able to pan and zoom when tool selected
                // or when using multiple fingers
                if(drawObj.selected != "pan&zoom" || drawObj.totalTouchActives <= 1) break;


                break;
        }
        // Save current x,y to known point for
        // connection between next position
        drawObj.lastKnwnPoint = {x,y}
    }
    onTouchEnd({touches}){
        // console.log(e)
        drawObj.totalTouchActives = touches.length
        if(this.action.actionid || drawObj.totalTouchActives == 0) this.pushServer(this.action)
        this.resetActionObj()
    }
    onTouchCancel(){
        drawObj.totalTouchActives = touches.length
        if(this.action.actionid || drawObj.totalTouchActives == 0) this.pushServer(this.action)
        this.resetActionObj()
    }
}
export function drawInitReceive(drawHistory){
    const actionsCount = drawHistory.length;
    $(".drawLoader").style.display = "grid";
    if (actionsCount == 0){
        $(".drawLoader").style.display = "none";
        return
    }
    drawHistory.forEach((action,idx)=>{
        setTimeout(()=>{
            onDrawUpdateReceived(action)
            console.log(idx, actionsCount-1)
            if(idx == actionsCount - 1){
                $(".drawLoader").style.display = "none";
            }
        }, idx * (1000 / actionsCount));
    })
}
export function onDrawUpdateReceived(data){
    drawObj.CANVAS.fromServer(data);
}
export function onDrawVerified(obj){
    const results = drawObj.myActions.filter((action)=>{if (action.actionid == obj.actionid) return true})
    if (results.length > 0){
        drawObj.CANVAS.fromServer(results[0])
        drawObj.myActions = drawObj.myActions.filter((action)=>{if (action.actionid != obj.actionid) return true})
    }
}