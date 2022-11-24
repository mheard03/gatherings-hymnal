import{S as s}from"./Search.js";import{H as a}from"./HymnsDbProgress.js";import{_ as n,c as l,a as e,b as r,w as t,F as o,r as i,o as c,d,n as m,t as b}from"./main.js";const h="",u={components:{Search:s,HymnsDbProgress:a},data:()=>({hymnals:[]}),async mounted(){let s=await this.$hymnsDb.getHymnals();this.hymnals=s.values()}},f=e("nav",{id:"primaryNav",class:"scaled navbar navbar-expand-lg navbar-dark bg-primary"},[e("div",{class:"container flex-nowrap overflow-hidden"},[e("button",{id:"candle",class:"btn btn-outline flex-shrink-0 me-2"}," "),e("a",{class:"navbar-brand flex-fill me-2 overflow-hidden"}," Gatherings in Jesus' Name ")])],-1),p={class:"top-block"},v={class:"container"},y=e("h1",null,"Find a song",-1),g={class:"container"},w=e("h3",{class:"mb-3"},"Browse the songbooks",-1);function _sfc_render(s,a,n,h,u,_){const k=i("Search"),x=i("router-link"),H=i("HymnsDbProgress");return c(),l(o,null,[f,e("main",null,[e("div",p,[e("div",v,[y,r(k,{"hide-label":!0})])]),e("div",g,[w,r(H,{progressProp:"hymnals"},{default:t((()=>[(c(!0),l(o,null,d(u.hymnals,(s=>(c(),l("p",null,[r(x,{class:m(["btn btn-lg btn-fill w-100",`theme-${s.hymnalId}`]),to:s.url},{default:t((()=>[e("span",null,b(s.title),1)])),_:2},1032,["class","to"])])))),256))])),_:1})])])],64)}const _=n(u,[["render",_sfc_render]]);export{_ as default};
//# sourceMappingURL=Home.js.map