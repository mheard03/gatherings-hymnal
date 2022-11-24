import{S as e}from"./Search.js";import{_ as s,c as a,a as r,b as t,e as n,F as l,i,t as o,d,o as c,n as h,k as u,p as m,j as p,r as y}from"./main.js";const v="",f={props:{keywords:{type:String,required:!1,default:""},page:{type:Number,required:!1,default:1}},data:()=>({mode:"keyword",results:void 0,resultCount:void 0,pageCount:void 0,loading:!0}),mounted(){this.$refs.searchForm.value=this.keywords,this.mode=this.$refs.searchForm.mode,this.$watch((()=>this.$refs.searchForm.mode),(e=>this.mode=e))},methods:{async onResultClick(e){if(e){try{let e=this.$route.path,s=this.$refs.searchForm.value,a=this.$router.resolve({path:e,query:{keywords:s.trim()}});this.$router.replace(a)}catch{}await this.$nextTick(),this.$router.push(e.url)}}},watch:{$route:{async handler(e){if("search"!=this.$route.name)return;let s=this.$route.query.keywords,a=this.$route.query.page;this.loading=!0,this.results=await this.$hymnsDb.search(s,a)},immediate:!0},results(e){["resultCount","perPage","pageCount"].forEach((s=>this[s]=e[s])),this.$forceUpdate(),this.loading=!1}},components:{Search:e}},_withScopeId=e=>(m("data-v-47050191"),e=e(),p(),e),k={id:"primaryNav",class:"scaled navbar navbar-expand-lg navbar-dark bg-primary"},b={class:"container flex-nowrap overflow-hidden"},g=void 0,$=[_withScopeId((()=>r("svg",{class:"icon"},[r("use",{href:"#back"})],-1)))],w=_withScopeId((()=>r("a",{class:"navbar-brand flex-fill me-2"},"Search",-1))),C={class:"top-block"},S={class:"container"},_={key:0,id:"loading"},x=void 0,F=void 0,T=[_withScopeId((()=>r("div",{class:"spinner-border mb-2"},null,-1))),_withScopeId((()=>r("span",{class:"message fs-5",role:"status"},"Searching...",-1)))],q={key:1,id:"search-results",class:"container"},H={class:"mb-3"},L={class:"hymnal-label scaled"},M={class:"rounded"},j=["href","onClick"],I=["innerHTML"],N=["innerHTML"];function _sfc_render(e,s,m,p,v,f){const g=y("Search");return c(),a(l,null,[r("nav",k,[r("div",b,[r("button",{class:"btn btn-fill back",onClick:s[0]||(s[0]=s=>e.$router.backOrDefault())},$),w])]),r("main",null,[r("div",C,[r("div",S,[t(g,{ref:"searchForm","initial-mode":"keyword","label-class":"h1"},null,512)])]),v.loading?(c(),a("div",_,T)):n("",!0),v.loading||"keyword"!=v.mode?n("",!0):(c(),a("div",q,[r("p",H,[v.pageCount>1?(c(),a(l,{key:0},[i("Page "+o(m.page)+" of",1)],64)):n("",!0),i(" "+o(v.resultCount)+" results ",1)]),(c(!0),a(l,null,d(v.results,(e=>(c(),a("div",{key:e.hymn.hymnId,class:h(["result","theme-"+e.hymn.hymnalId])},[r("div",L,[r("span",M,o(e.hymn.hymnal.title)+" #"+o(e.hymn.hymnNoTxt),1)]),r("a",{class:"result-link fs-5",href:e.hymn.url,onClick:u((s=>f.onResultClick(e.hymn)),["stop","prevent"])},[r("span",{innerHTML:e.title},null,8,I)],8,j),e.preview?(c(),a("p",{key:0,class:"result-preview",innerHTML:e.preview},null,8,N)):n("",!0)],2)))),128))]))])],64)}const D=s(f,[["render",_sfc_render],["__scopeId","data-v-47050191"]]);export{D as default};
//# sourceMappingURL=SearchResults.js.map
