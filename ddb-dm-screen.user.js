// ==UserScript==
// @name         ddb-dm-screen
// @namespace    https://github.com/lothsun/ddb-dm-screen/
// @version      2.1.0
// @description  Poor man's DM screen for DDB campaigns
// @author       Mivalsten Lothsun
// @match        https://www.dndbeyond.com/campaigns/*
// @grant        none
// @license      MIT; https://github.com/lothsun/ddb-dm-screen/blob/master/LICENSE
// ==/UserScript==

var $ = window.jQuery;

class Character {
  constructor(name) {
    this.name = name;
  };
  get level() {
    var classes = this.iframe.find('.ct-character-tidbits__classes').text().split('/').map(function(i){return parseInt(i.replace(/[^0-9]+/g, ''))});
    return classes.reduce((a, b) => a + b, 0);
  }
  get proficiency() {
    return Math.ceil(this.level / 4) + 1;
  }

  get id(){
    return this.name.replace(/[^0-9a-zA-Z]+/g, '');
  }

  get iframe(){
    return $(`#frame-${this.id}`).contents();
  }

  get ac(){
    return parseInt(this.iframe.find(".ct-armor-class-box__value").text());
  }

  get currentHP(){
    return parseInt(this.iframe.find(".ct-status-summary-mobile__hp-current").text());
  }

  get maxHP(){
    return parseInt(this.iframe.find(".ct-status-summary-mobile__hp-max").text());
  }

  get passivePerception(){
    var selector = ".ct-senses .ct-senses__callout:has(.ct-senses__callout-label:contains(Perception))";
    return parseInt(this.iframe.find(selector).find(".ct-senses__callout-value").text());
  }

  get passiveInsight(){
    var selector = ".ct-senses .ct-senses__callout:has(.ct-senses__callout-label:contains(Insight))";
    return parseInt(this.iframe.find(selector).find(".ct-senses__callout-value").text());
  }

  get passiveInvestigation(){
    var selector = ".ct-senses .ct-senses__callout:has(.ct-senses__callout-label:contains(Investigation))";
    return parseInt(this.iframe.find(selector).find(".ct-senses__callout-value").text());
  }

  get stats(){
    var stats = {};
    var iframe = this.iframe;
    iframe.find('.ct-ability-summary').each(function(index){
      let name = $(this).find('.ct-ability-summary__abbr').text();
      stats[name] = {
        value: Math.max(
          parseInt($(this).find('.ct-ability-summary__primary').text()),
          parseInt($(this).find('.ct-ability-summary__secondary').text())
        ),
        modifier: Math.min(
          parseInt($(this).find('.ct-ability-summary__primary').text()),
          parseInt($(this).find('.ct-ability-summary__secondary').text())
        ),
        savingThrow: iframe.find(`.ct-saving-throws-summary__ability--${name} .ct-signed-number`).text()
      };
    });
    return stats;
  }

  get skills(){
    var skills = {};
    this.iframe.find('.ct-skills__item').each(function() {
      var name = $(this).children('.ct-skills__col--skill').text();
      var value = $(this).children('.ct-skills__col--modifier').text();
      skills[name] = value;
    });
    return skills;
  }

  get init(){
    var initNumber = parseInt(this.iframe.find(".ct-initiative-box__value > .ct-signed-number.ct-signed-number--large > .ct-signed-number__number").text());
    var initMod = this.iframe.find(".ct-initiative-box__value > .ct-signed-number.ct-signed-number--large > .ct-signed-number__sign").text();
    var init = {
      "number" : initNumber,
      "mod" : initMod
    }
    console.log(init)
    return init;
    
  }

  get speed(){
    // console.log(parseInt(this.iframe.find(".ct-distance-number__number").text()));
    return parseInt(this.iframe.find(".ct-distance-number__number").text());
    
  }

  get saveDc(){
    this.iframe.find(".ct-quick-nav__toggle").trigger("click");
    this.iframe.find(".ct-quick-nav__menu-item--spells").children().first().trigger("click");
    var selector = ".ct-spells__casting .ct-spells-level-casting__info-group:has(.ct-spells-level-casting__info-label:contains(Save))";
    console.log(this.iframe.find(selector).find(".ct-spells-level-casting__info-item").text());
    return parseInt(this.iframe.find(selector).find(".ct-spells-level-casting__info-item").text());

  }
};

function render(character, node){
  var tableId = `character-details-${character.id}`;

  var genStats = `
  <div class="genStats">
    <div class="genStats__container">
    </div>
  </div>
  `;

  var saveDcModule =`
  <div class="genStats__module genStats__module--savedc">
    <div class="genStats__heading">
      <div class="genStats__label">Save</div>
    </div>
    <div class="genStats__value">saveNumber</div>
    <div class="genStats__footer">
      <div class="genStats__label">DC</div>
    </div>
  </div>
  `;

  var speedModule =`
    <div class="genStats__module genStats__module--speed">
      <div class="genStats__heading">
        <div class="genStats__label">walking</div>
      </div>
      <div class="genStats__value">
        <span class="genStats__distance">
          <span class="genStats__distance--number">speedNumber</span>
          <span class="genStats__distance--label">ft.</span>
        </span>
      </div>
      <div class="genStats__footer">
        <div class="genStats__label">Speed</div>
      </div>
    </div>
  `;

  var initModule =`
    <div class="genStats__module genStats__module--init">
      <div class="genStats__value">
        <span class="genStats__number genStats__number--large">
          <span class="genStats__number--sign">initMod</span>
          <span class="genStats__number--number">initNumber</span>
        </span>
      </div>
      <div class="genStats__footer">
        <div class="genStats__label">initiative</div>
      </div>
    </div>
  `;

  var armorClassModule =`
  <div class="genStats__module genStats__module--armorClass">
    <div class="genStats__heading">
      <div class="genStats__label">armor</div>
    </div>
    <div class="genStats__value">ac</div>
    <div class="genStats__footer">
      <div class="genStats__label">Class</div>
    </div>
  </div>
  `;

  var healthModule =`
  <div class="genStats__module genStats__module--health">
    <div class="genStats__value">
      <span class=".genStats__health--hp-current">currentHP</span>
      <span class=".genStats__health--hp-sep">/</span>
      <span class=".genStats__health--hp-max">maxHP</span>
    </div>
      <div class="genStats__label">Hit Points</div>
    </div>
  </div>
  `;

  // var div = `
  //   <div>
  //     <table id="${tableId}">
  //       <thead>
  //         <tr>
  //           <th></th>
  //           <th align="center">Value</th>
  //           <th align="center">Modifier</th>
  //           <th align="center">Saving throw</th>
  //         </tr>
  //       </thead>
  //       <tbody></tbody>
  //     </table>
  //   </div>
  // `;

  // var statRow = `
  //   <tr>
  //     <th>title</th>
  //     <td align="center">value</td>
  //     <td align="center">mod</td>
  //     <td align="center">save</td>
  //   </tr>
  // `;

  // var otherRow = `
  //   <tr>
  //     <th>name</th>
  //     <td align="center">value</td>
  //     <td></td><td></td>
  //   </tr>
  // `;

  // node.parents('.ddb-campaigns-character-card').after(div);
  // var footer = $(`#${tableId} > tbody:last-child`);
  // for(var s in character.stats){
  //   var text = statRow
  //     .replace("title", s.toUpperCase())
  //     .replace("value", character.stats[s].value)
  //     .replace("mod", character.stats[s].modifier)
  //     .replace("save", character.stats[s].savingThrow);
  //   footer.append(text);
  // }

  // otherInfo = {
  //   "Proficiency": `+${character.proficiency}`,
  //   "HP": `${character.currentHP} / ${character.maxHP}`,
  //   "AC": character.ac,
  //   "Passive Investigation": character.passiveInvestigation,
  //   "Passive Perception": character.passivePerception,
  //   "Passive Insight": character.passiveInsight,
  //   "Initiative": character.init.mod + character.init.number,
  //   "Speed": character.speed,
  //   "Save DC": character.saveDc,
  // }

  // for (name in otherInfo){
  //   footer.append(otherRow.replace("name", name).replace("value", otherInfo[name]));
  // }
  node.parents('.ddb-campaigns-character-card').find('.ddb-campaigns-character-card-header').after(genStats); // add general stats to the player card
  node.parents('.ddb-campaigns-character-card').find('.genStats__container').append(speedModule.replace("speedNumber", character.speed)); //add player walking speed to general stats div
  node.parents('.ddb-campaigns-character-card').find('.genStats__container').append(initModule.replace("initNumber", character.init.number).replace("initMod", character.init.mod)); //add player initiative mod to general stats div
  node.parents('.ddb-campaigns-character-card').find('.genStats__container').append(armorClassModule.replace("ac", character.ac)); //add player armor class to general stats div
  node.parents('.ddb-campaigns-character-card').find('.genStats__container').append(healthModule.replace("currentHP", character.currentHP).replace("maxHP", character.maxHP)); //add player current and max hp to general stats div
  node.parents('.ddb-campaigns-character-card').find('.genStats__container').prepend(saveDcModule.replace("saveNumber", character.saveDc)); //add player Save DC to front of general stats div

  
}

function prerender(character, node, times) {
    if (!isNaN(character.ac)) {render(character, node);}
    else {
        times += 1;
        if (times < 80) {setTimeout(function() {prerender(character, node, times);}, 500);};
    }
}

(function() {
  $('#site').after('<div id="iframeDiv" style="opacity: 0; position: absolute;"></div>'); //visibility: hidden;
  let chars = $('.ddb-campaigns-detail-body-listing-active').find('.ddb-campaigns-character-card-footer-links-item-view');
  chars.each(function(index, value) {
      let node = $(this);
      let name = node.parents('.ddb-campaigns-character-card').find('.ddb-campaigns-character-card-header-upper-character-info-primary').text();
      let character = new Character(name);
      let newIframe = document.createElement('iframe');
      //after loading iframe, wait for a second to let JS create content.
      newIframe.onload = function(){prerender(character, node, 0)};
      newIframe.id = `frame-${character.id}`;
      newIframe.style = "position: absolute;"; //visibility: hidden;
      newIframe.width = 1000;
      newIframe.height = 1;
      newIframe.seamless = "";
      newIframe.src = node.attr('href');
      document.body.appendChild(newIframe);
      $('#iframeDiv').append(newIframe);
    }
  );
  $('head').append('<link rel="stylesheet" href="https://raw.githack.com/lothsun/ddb-dm-screen/master/style.css" type="text/css" />')
})();
