// ==UserScript==
// @name        DeFi Kingdoms Helper
// @namespace   DirtyCajunRice
// @match       https://beta.defikingdoms.com/
// @match       https://game.defikingdoms.com/
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// @version     1.2.2
// @author      DirtyCajunRice
// @description Helper for DeFi Kingdoms Game
// @license     MIT
// @copyright   2022, DirtyCajunRice (https://openuserjs.org/users/dirtycajunrice)
// @downloadURL https://openuserjs.org/install/dirtycajunrice/DeFi_Kingdoms_Helper.user.js
// @updateURL   https://openuserjs.org/meta/dirtycajunrice/DeFi_Kingdoms_Helper.meta.js
// @homepageURL https://github.com/dirtycajunrice/violentmonkey_scripts/DefiKingdomsHelper/
// @supportURL  https://github.com/dirtycajunrice/violentmonkey_scripts/issues
// ==/UserScript==
// ==OpenUserJS==
// @author dirtycajunrice
// ==/OpenUserJS==

/* jshint esversion: 6 */

GM_addStyle(`
.GMR {
  display: grid;
  grid-template-columns:repeat(3, minmax(0, 1fr)); align-items: center;
  opacity: 0.85;
  font-size: 13px;
  font-family: Lora, serif;
  align-items: center;
  text-align: center;
}
.red {
  color: red;
}
.orange {
  color: orange;
}
.yellow {
  color: yellow;
}
.green {
  color: green;
}
`);

const divInnerHTML = `
<div class="GMR-Profession">
  <span class="GMR-Profesion-Title">Profession</span>
  <br>
  <span class="GMR-Profession-Percentile"></span>
</div>
<div class="GMR-PVP">
  <span class="GMR-PVP-Title">PVP</span>
  <br>
  <span class="GMR-PVP-Percentile"></span>
</div>
<div class="GMR-Summoning">
  <span class="GMR-Summoning-Title">Summoning</span>
  <br>
  <span class="GMR-Summoning-Percentile"></span>
</div>
`;

function scoreColor(score) {
  if (score > 90) {
    return "green";
  }
  else if (score > 80) {
    return "yellow";
  }
  else if (score > 70) {
    return "orange";
  }
  else {
    return "red";
  }
}

function getHeroPercentiles(heroID, div) {

  GM_xmlhttpRequest({
    method: "GET",
    url: `http://dfktavern.com/api/hero/profRanking?search[value]=${heroID}&search[regex]=false`,
    headers: {
      "Accept": "text/json",
    },
    onload: function (response) {
      let r = null;
      if (!response.responseJSON) {
        let scores = JSON.parse(response.responseText).profRanking[0];

        let prof = div.querySelector('span.GMR-Profession-Percentile');
        prof.innerText = `${parseFloat(scores.scoreV2_0.bestProfPercentile).toFixed(2)}%`;
        prof.classList.add(scoreColor(scores.scoreV2_0.bestProfPercentile));

        let pvp = div.querySelector('span.GMR-PVP-Percentile');
        pvp.innerText = `${parseFloat(scores.scoreV2_10.pvp_ranking).toFixed(2)}%`;
        pvp.classList.add(scoreColor(scores.scoreV2_10.pvp_ranking));

        let summon = div.querySelector('span.GMR-Summoning-Percentile');
        summon.innerText = `${parseFloat(scores.scoreV2_0.summoningRank).toFixed(2)}%`;
        summon.classList.add(scoreColor(scores.scoreV2_0.summoningRank));
      }
    }
  });
}

const MO = window.MutationObserver || window.WebKitMutationObserver;

var obs = new MO((mutations) => {
  for (var i = 0; i < mutations.length; ++i) {
    for (var j = 0; j < mutations[i].addedNodes.length; ++j) {
      let node = mutations[i].addedNodes[j];

      if (node.classList === undefined) return;

      if (node.classList.contains('cardContainer')) {
        let lb = mutations[i].addedNodes[j].closest(".buy-heroes-list-box.bordered-box-thin");

        if (lb.querySelector('div.GMR') !== null) return;

        let pricing = lb.querySelector('.pricing.align-center');

        var div = document.createElement('div');
        div.setAttribute('class', 'GMR');
        div.innerHTML = divInnerHTML;

        lb.insertBefore(div, pricing);
        let heroID = lb.firstChild.firstChild.innerText.replace('#', '');
        getHeroPercentiles(heroID, div);
      }
    }
  }
});
const config = {
  attributes: true,
  childList: true,
  subtree: true,
  characterData: true
};
obs.observe(document, config);
