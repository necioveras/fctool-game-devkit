(function(global){
  "use strict";
  const NS="fctool.game", PROTOCOL_VERSION="1.0";
  function uid(){return typeof crypto!=="undefined"&&crypto.randomUUID?crypto.randomUUID():`msg_${Date.now()}_${Math.random().toString(16).slice(2)}`}
  function queryOrigin(){try{return new URLSearchParams(window.location.search).get("fctool_origin")}catch(e){return null}}
  class FCToolGame {
    constructor(options){
      if(!options||!options.gameId||!options.gameVersion) throw new Error("FCToolGame requer gameId e gameVersion.");
      this.options={gameId:options.gameId,gameVersion:options.gameVersion,targetOrigin:options.targetOrigin||queryOrigin()||"*",initializeTimeoutMs:options.initializeTimeoutMs||10000};
      this.initialized=false; this.context=null; this.initPromise=null;
    }
    initialize(){
      if(this.initPromise)return this.initPromise;
      this.initPromise=new Promise((resolve,reject)=>{
        const onMessage=(event)=>{
          if(event.source!==window.parent)return;
          if(this.options.targetOrigin!=="*"&&event.origin!==this.options.targetOrigin)return;
          const msg=event.data;
          if(!msg||msg.namespace!==NS||msg.protocolVersion!==PROTOCOL_VERSION||msg.type!=="INITIALIZE")return;
          clearTimeout(timeout); window.removeEventListener("message",onMessage); this.initialized=true; this.context=msg.payload; resolve(this.context);
        };
        const timeout=setTimeout(()=>{window.removeEventListener("message",onMessage);reject(new Error("Timeout aguardando INITIALIZE do FCTool."))},this.options.initializeTimeoutMs);
        window.addEventListener("message",onMessage);
        this._send("HELLO",{gameId:this.options.gameId,gameVersion:this.options.gameVersion},true);
      });
      return this.initPromise;
    }
    getContext(){return this.context}
    ready(data){this._requireInitialized();this._send("READY",data||{})}
    start(data){this._requireInitialized();this._send("STARTED",data||{})}
    pause(data){this._requireInitialized();this._send("PAUSED",data||{})}
    resume(data){this._requireInitialized();this._send("RESUMED",data||{})}
    score(value,max){this._requireInitialized();if(!Number.isFinite(value))throw new Error("score(value) requer número finito.");const payload={value:value};if(max!==undefined)payload.max=max;this._send("SCORE",payload)}
    emit(name,data){this._requireInitialized();if(!name||typeof name!=="string")throw new Error("emit(name) requer um nome.");this._send("EVENT",{name:name,data:data||{}})}
    complete(data){this._requireInitialized();this._send("COMPLETED",data||{})}
    error(code,message,data){this._send("ERROR",{code:code,message:message,data:data||{}},true)}
    _requireInitialized(){if(!this.initialized)throw new Error("FCToolGame ainda não foi inicializado. Aguarde initialize().")}
    _send(type,payload,allowBeforeInit){
      if(!allowBeforeInit)this._requireInitialized();
      if(window.parent===window)throw new Error("O jogo deve ser executado dentro de um host/iframe FCTool ou mock host.");
      window.parent.postMessage({namespace:NS,protocolVersion:PROTOCOL_VERSION,type:type,messageId:uid(),timestamp:new Date().toISOString(),payload:payload},this.options.targetOrigin);
    }
  }
  global.FCToolGameSDK={FCToolGame:FCToolGame,protocolVersion:PROTOCOL_VERSION};
})(window);
