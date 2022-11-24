const e=1e3,t="transitionend",toType=e=>null==e?`${e}`:{}.toString.call(e).match(/\s([a-z]+)/i)[1].toLowerCase(),getSelector=e=>{let t=e.getAttribute("data-bs-target");if(!t||"#"===t){let n=e.getAttribute("href");if(!n||!n.includes("#")&&!n.startsWith("."))return null;n.includes("#")&&!n.startsWith("#")&&(n=`#${n.split("#")[1]}`),t=n&&"#"!==n?n.trim():null}return t},getElementFromSelector=e=>{const t=getSelector(e);return t?document.querySelector(t):null},getTransitionDurationFromElement=e=>{if(!e)return 0;let{transitionDuration:t,transitionDelay:n}=window.getComputedStyle(e);const r=Number.parseFloat(t),o=Number.parseFloat(n);return r||o?(t=t.split(",")[0],n=n.split(",")[0],1e3*(Number.parseFloat(t)+Number.parseFloat(n))):0},triggerTransitionEnd=e=>{e.dispatchEvent(new Event(t))},isElement=e=>!(!e||"object"!=typeof e)&&(void 0!==e.jquery&&(e=e[0]),void 0!==e.nodeType),getElement=e=>isElement(e)?e.jquery?e[0]:e:"string"==typeof e&&e.length>0?document.querySelector(e):null,typeCheckConfig=(e,t,n)=>{Object.keys(n).forEach((r=>{const o=n[r],a=t[r],s=a&&isElement(a)?"element":toType(a);if(!new RegExp(o).test(s))throw new TypeError(`${e.toUpperCase()}: Option "${r}" provided type "${s}" but expected type "${o}".`)}))},isVisible=e=>!(!isElement(e)||0===e.getClientRects().length)&&"visible"===getComputedStyle(e).getPropertyValue("visibility"),isDisabled=e=>!e||e.nodeType!==Node.ELEMENT_NODE||!!e.classList.contains("disabled")||(void 0!==e.disabled?e.disabled:e.hasAttribute("disabled")&&"false"!==e.getAttribute("disabled")),noop=()=>{},reflow=e=>{e.offsetHeight},getjQuery=()=>{const{jQuery:e}=window;return e&&!document.body.hasAttribute("data-bs-no-jquery")?e:null},n=[],onDOMContentLoaded=e=>{"loading"===document.readyState?(n.length||document.addEventListener("DOMContentLoaded",(()=>{n.forEach((e=>e()))})),n.push(e)):e()},isRTL=()=>"rtl"===document.documentElement.dir,defineJQueryPlugin=e=>{onDOMContentLoaded((()=>{const t=getjQuery();if(t){const n=e.NAME,r=t.fn[n];t.fn[n]=e.jQueryInterface,t.fn[n].Constructor=e,t.fn[n].noConflict=()=>(t.fn[n]=r,e.jQueryInterface)}}))},execute=e=>{"function"==typeof e&&e()},executeAfterTransition=(e,n,r=!0)=>{if(!r)return void execute(e);const o=5,a=getTransitionDurationFromElement(n)+5;let s=!1;const handler=({target:r})=>{r===n&&(s=!0,n.removeEventListener(t,handler),execute(e))};n.addEventListener(t,handler),setTimeout((()=>{s||triggerTransitionEnd(n)}),a)},getNextActiveElement=(e,t,n,r)=>{let o=e.indexOf(t);if(-1===o)return e[!n&&r?e.length-1:0];const a=e.length;return o+=n?1:-1,r&&(o=(o+a)%a),e[Math.max(0,Math.min(o,a-1))]},r=/[^.]*(?=\..*)\.|.*/,o=/\..*/,a=/::\d+$/,s={};let i=1;const l={mouseenter:"mouseover",mouseleave:"mouseout"},u=/^(mouseenter|mouseleave)/i,c=new Set(["click","dblclick","mouseup","mousedown","contextmenu","mousewheel","DOMMouseScroll","mouseover","mouseout","mousemove","selectstart","selectend","keydown","keypress","keyup","orientationchange","touchstart","touchmove","touchend","touchcancel","pointerdown","pointermove","pointerup","pointerleave","pointercancel","gesturestart","gesturechange","gestureend","focus","blur","change","reset","select","submit","focusin","focusout","load","unload","beforeunload","resize","move","DOMContentLoaded","readystatechange","error","abort","scroll"]);function getUidEvent(e,t){return t&&`${t}::${i++}`||e.uidEvent||i++}function getEvent(e){const t=getUidEvent(e);return e.uidEvent=t,s[t]=s[t]||{},s[t]}function bootstrapHandler(e,t){return function handler(n){return n.delegateTarget=e,handler.oneOff&&d.off(e,n.type,t),t.apply(e,[n])}}function bootstrapDelegationHandler(e,t,n){return function handler(r){const o=e.querySelectorAll(t);for(let{target:a}=r;a&&a!==this;a=a.parentNode)for(let s=o.length;s--;)if(o[s]===a)return r.delegateTarget=a,handler.oneOff&&d.off(e,r.type,t,n),n.apply(a,[r]);return null}}function findHandler(e,t,n=null){const r=Object.keys(e);for(let o=0,a=r.length;o<a;o++){const a=e[r[o]];if(a.originalHandler===t&&a.delegationSelector===n)return a}return null}function normalizeParams(e,t,n){const r="string"==typeof t,o=r?n:t;let a=getTypeEvent(e);const s=void 0;return c.has(a)||(a=e),[r,o,a]}function addHandler(e,t,n,o,a){if("string"!=typeof t||!e)return;if(n||(n=o,o=null),u.test(t)){const wrapFn=e=>function(t){if(!t.relatedTarget||t.relatedTarget!==t.delegateTarget&&!t.delegateTarget.contains(t.relatedTarget))return e.call(this,t)};o?o=wrapFn(o):n=wrapFn(n)}const[s,i,l]=normalizeParams(t,n,o),c=getEvent(e),d=c[l]||(c[l]={}),f=findHandler(d,i,s?n:null);if(f)return void(f.oneOff=f.oneOff&&a);const p=getUidEvent(i,t.replace(r,"")),m=s?bootstrapDelegationHandler(e,n,o):bootstrapHandler(e,n);m.delegationSelector=s?n:null,m.originalHandler=i,m.oneOff=a,m.uidEvent=p,d[p]=m,e.addEventListener(l,m,s)}function removeHandler(e,t,n,r,o){const a=findHandler(t[n],r,o);a&&(e.removeEventListener(n,a,Boolean(o)),delete t[n][a.uidEvent])}function removeNamespacedHandlers(e,t,n,r){const o=t[n]||{};Object.keys(o).forEach((a=>{if(a.includes(r)){const r=o[a];removeHandler(e,t,n,r.originalHandler,r.delegationSelector)}}))}function getTypeEvent(e){return e=e.replace(o,""),l[e]||e}const d={on(e,t,n,r){addHandler(e,t,n,r,!1)},one(e,t,n,r){addHandler(e,t,n,r,!0)},off(e,t,n,r){if("string"!=typeof t||!e)return;const[o,s,i]=normalizeParams(t,n,r),l=i!==t,u=getEvent(e),c=t.startsWith(".");if(void 0!==s){if(!u||!u[i])return;return void removeHandler(e,u,i,s,o?n:null)}c&&Object.keys(u).forEach((n=>{removeNamespacedHandlers(e,u,n,t.slice(1))}));const d=u[i]||{};Object.keys(d).forEach((n=>{const r=n.replace(a,"");if(!l||t.includes(r)){const t=d[n];removeHandler(e,u,i,t.originalHandler,t.delegationSelector)}}))},trigger(e,t,n){if("string"!=typeof t||!e)return null;const r=getjQuery(),o=getTypeEvent(t),a=t!==o,s=c.has(o);let i,l=!0,u=!0,d=!1,f=null;return a&&r&&(i=r.Event(t,n),r(e).trigger(i),l=!i.isPropagationStopped(),u=!i.isImmediatePropagationStopped(),d=i.isDefaultPrevented()),s?(f=document.createEvent("HTMLEvents"),f.initEvent(o,l,!0)):f=new CustomEvent(t,{bubbles:l,cancelable:!0}),void 0!==n&&Object.keys(n).forEach((e=>{Object.defineProperty(f,e,{get:()=>n[e]})})),d&&f.preventDefault(),u&&e.dispatchEvent(f),f.defaultPrevented&&void 0!==i&&i.preventDefault(),f}};function normalizeData(e){return"true"===e||"false"!==e&&(e===Number(e).toString()?Number(e):""===e||"null"===e?null:e)}function normalizeDataKey(e){return e.replace(/[A-Z]/g,(e=>`-${e.toLowerCase()}`))}const f={setDataAttribute(e,t,n){e.setAttribute(`data-bs-${normalizeDataKey(t)}`,n)},removeDataAttribute(e,t){e.removeAttribute(`data-bs-${normalizeDataKey(t)}`)},getDataAttributes(e){if(!e)return{};const t={};return Object.keys(e.dataset).filter((e=>e.startsWith("bs"))).forEach((n=>{let r=n.replace(/^bs/,"");r=r.charAt(0).toLowerCase()+r.slice(1,r.length),t[r]=normalizeData(e.dataset[n])})),t},getDataAttribute:(e,t)=>normalizeData(e.getAttribute(`data-bs-${normalizeDataKey(t)}`)),offset(e){const t=e.getBoundingClientRect();return{top:t.top+window.pageYOffset,left:t.left+window.pageXOffset}},position:e=>({top:e.offsetTop,left:e.offsetLeft})},p=3,m={find:(e,t=document.documentElement)=>[].concat(...Element.prototype.querySelectorAll.call(t,e)),findOne:(e,t=document.documentElement)=>Element.prototype.querySelector.call(t,e),children:(e,t)=>[].concat(...e.children).filter((e=>e.matches(t))),parents(e,t){const n=[];let r=e.parentNode;for(;r&&r.nodeType===Node.ELEMENT_NODE&&3!==r.nodeType;)r.matches(t)&&n.push(r),r=r.parentNode;return n},prev(e,t){let n=e.previousElementSibling;for(;n;){if(n.matches(t))return[n];n=n.previousElementSibling}return[]},next(e,t){let n=e.nextElementSibling;for(;n;){if(n.matches(t))return[n];n=n.nextElementSibling}return[]},focusableChildren(e){const t=["a","button","input","textarea","select","details","[tabindex]",'[contenteditable="true"]'].map((e=>`${e}:not([tabindex^="-"])`)).join(", ");return this.find(t,e).filter((e=>!isDisabled(e)&&isVisible(e)))}},g=new Map,h={set(e,t,n){g.has(e)||g.set(e,new Map);const r=g.get(e);r.has(t)||0===r.size?r.set(t,n):console.error(`Bootstrap doesn't allow more than one instance per element. Bound instance: ${Array.from(r.keys())[0]}.`)},get:(e,t)=>g.has(e)&&g.get(e).get(t)||null,remove(e,t){if(!g.has(e))return;const n=g.get(e);n.delete(t),0===n.size&&g.delete(e)}},E="5.1.3";class BaseComponent{constructor(e){(e=getElement(e))&&(this._element=e,h.set(this._element,this.constructor.DATA_KEY,this))}dispose(){h.remove(this._element,this.constructor.DATA_KEY),d.off(this._element,this.constructor.EVENT_KEY),Object.getOwnPropertyNames(this).forEach((e=>{this[e]=null}))}_queueCallback(e,t,n=!0){executeAfterTransition(e,t,n)}static getInstance(e){return h.get(getElement(e),this.DATA_KEY)}static getOrCreateInstance(e,t={}){return this.getInstance(e)||new this(e,"object"==typeof t?t:null)}static get VERSION(){return"5.1.3"}static get NAME(){throw new Error('You have to implement the static method "NAME", for each component!')}static get DATA_KEY(){return`bs.${this.NAME}`}static get EVENT_KEY(){return`.${this.DATA_KEY}`}}export{BaseComponent as B,d as E,f as M,m as S,isDisabled as a,isElement as b,isVisible as c,defineJQueryPlugin as d,getNextActiveElement as e,getElementFromSelector as f,getElement as g,execute as h,isRTL as i,executeAfterTransition as j,noop as n,reflow as r,typeCheckConfig as t};
//# sourceMappingURL=base-component.js.map
