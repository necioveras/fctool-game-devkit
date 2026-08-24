const NS = "fctool.game";
const PROTOCOL_VERSION = "1.0";
function uid(){return typeof crypto!=="undefined"&&crypto.randomUUID?crypto.randomUUID():`msg_${Date.now()}_${Math.random().toString(16).slice(2)}`}
function queryOrigin(){try{return new URLSearchParams(window.location.search).get("fctool_origin")}catch{return null}}
export class FCToolGame {
  constructor(options){
    if(!options?.gameId||!options?.gameVersion) throw new Error("FCToolGame requer gameId e gameVersion.");
    this.options={gameId:options.gameId,gameVersion:options.gameVersion,targetOrigin:options.targetOrigin||queryOrigin()||"*",initializeTimeoutMs:options.initializeTimeoutMs??10000};
    this.initialized=false; this.context=null; this.initPromise=null;
  }
  initialize(){
    if(this.initPromise) return this.initPromise;
    this.initPromise=new Promise((resolve,reject)=>{
      const timeout=window.setTimeout(()=>{window.removeEventListener("message",onMessage);reject(new Error("Timeout aguardando INITIALIZE do FCTool."))},this.options.initializeTimeoutMs);
      const onMessage=(event)=>{
        if(event.source!==window.parent) return;
        if(this.options.targetOrigin!=="*"&&event.origin!==this.options.targetOrigin) return;
        const msg=event.data;
        if(!msg||msg.namespace!==NS||msg.protocolVersion!==PROTOCOL_VERSION||msg.type!=="INITIALIZE") return;
        window.clearTimeout(timeout); window.removeEventListener("message",onMessage); this.initialized=true; this.context=msg.payload; resolve(this.context);
      };
      window.addEventListener("message",onMessage);
      this.send("HELLO",{gameId:this.options.gameId,gameVersion:this.options.gameVersion},true);
    });
    return this.initPromise;
  }
  getContext(){return this.context}
  ready(data={}){this.requireInitialized();this.send("READY",data)}
  start(data={}){this.requireInitialized();this.send("STARTED",data)}
  pause(data={}){this.requireInitialized();this.send("PAUSED",data)}
  resume(data={}){this.requireInitialized();this.send("RESUMED",data)}
  score(value,max){this.requireInitialized();if(!Number.isFinite(value))throw new Error("score(value) requer número finito.");const payload={value};if(max!==undefined)payload.max=max;this.send("SCORE",payload)}
  emit(name,data={}){this.requireInitialized();if(!name||typeof name!=="string")throw new Error("emit(name) requer um nome.");this.send("EVENT",{name,data})}
  complete(data={}){this.requireInitialized();this.send("COMPLETED",data)}
  error(code,message,data={}){this.send("ERROR",{code,message,data},true)}
  requireInitialized(){if(!this.initialized)throw new Error("FCToolGame ainda não foi inicializado. Aguarde initialize().")}
  send(type,payload,allowBeforeInit=false){
    if(!allowBeforeInit)this.requireInitialized();
    if(window.parent===window)throw new Error("O jogo deve ser executado dentro de um host/iframe FCTool ou mock host.");
    window.parent.postMessage({namespace:NS,protocolVersion:PROTOCOL_VERSION,type,messageId:uid(),timestamp:new Date().toISOString(),payload},this.options.targetOrigin);
  }
}
