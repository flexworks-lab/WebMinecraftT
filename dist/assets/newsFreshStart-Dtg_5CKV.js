(function(){const s="newsFreshStartStyles";function r(){if(document.getElementById(s))return;const e=document.createElement("style");e.id=s,e.textContent=`
            #newsList .newsItem:not(.liveNewsItem) { display: none !important; }
            #newsList .newsEmptyState {
                padding: 18px 14px;
                color: #999;
                font-size: 12px;
                line-height: 1.5;
                text-align: center;
                border: 1px dashed #444;
                background: #242424;
            }
        `,document.head.appendChild(e)}function n(){r();const e=document.getElementById("newsList");if(!e)return!1;let t=e.querySelector(".newsEmptyState");return t||(t=document.createElement("div"),t.className="newsEmptyState",t.textContent="No news tabs yet. Create a new News tab from Developer Controls.",e.appendChild(t)),t.style.display=e.querySelector(".liveNewsItem")?"none":"block",!0}function o(){if(n()){const t=document.getElementById("newsList");new MutationObserver(n).observe(t,{childList:!0});return}const e=new MutationObserver(()=>{n()&&e.disconnect()});e.observe(document.body,{childList:!0,subtree:!0})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",o,{once:!0}):o()})();
