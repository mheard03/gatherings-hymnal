import{H as s,_ as r,o as e,c as a,a as o,F as t,t as n,e as p,n as d,l as g,m as i,q as l,p as c,j as u}from"./main.js";const m="";let b=s.STATES;const y={props:{progressProp:{required:!0},content:{type:String,default:s=>s.progressProp},loading:{type:String,default:s=>`Loading ${s.content}...`},error:{type:String,default:s=>`Error loading ${s.content}.`}},data:()=>({STATES:b}),computed:{className(){return this.progressPropObj.status==b.ERROR?"error":"loading"},progressPropObj(){return"string"==typeof this.progressProp?s.progress[this.progressProp]:this.progressProp}}},f=void 0,P={class:"hymns-db-status-content"},v={class:"message"},j={key:0,class:"message-details"},S=(s=>(c("data-v-182b892d"),s=s(),u(),s))((()=>o("div",{class:"spinner-border mb-2"},null,-1))),_={class:"message fs-5",role:"status"};function _sfc_render(s,r,c,u,m,b){return b.progressPropObj.status?l(s.$slots,"default",{key:1},void 0,!0):(e(),a("div",g(i({key:0},s.$attrs)),[o("div",{class:d(["hymns-db-status-block",b.className])},[o("div",P,["error"==b.className?(e(),a(t,{key:0},[o("span",v,n(c.error),1),b.progressPropObj.errorMesage?(e(),a("span",j,n(b.progressPropObj.errorMesage),1)):p("",!0)],64)):(e(),a(t,{key:1},[S,o("span",_,n(c.loading),1)],64))])],2)],16))}const h=r(y,[["render",_sfc_render],["__scopeId","data-v-182b892d"]]);export{h as H};
//# sourceMappingURL=HymnsDbProgress.js.map
