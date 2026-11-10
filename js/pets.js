/**
 * Pet Quests — pet definitions + original SVG renderers by growth stage.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.PQPets = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var PETS = [
    {
      id: 'puppy',
      name: 'Puppy',
      blurb: 'Loyal, bouncy, and ready for garden adventures.',
      accent: '#c4784a'
    },
    {
      id: 'kitten',
      name: 'Kitten',
      blurb: 'Curious and soft-pawed, loves sunny windows.',
      accent: '#7a8f6a'
    },
    {
      id: 'bunny',
      name: 'Bunny',
      blurb: 'Gentle hopper who tends the carrot patch.',
      accent: '#b08968'
    },
    {
      id: 'owl',
      name: 'Owl',
      blurb: 'Quiet watcher of dusk and starry evenings.',
      accent: '#6b7c8a'
    }
  ];

  var STAGE_LABELS = [
    'A new friend',
    'Growing steadily',
    'Getting stronger',
    'Looking confident',
    'Ready for big days'
  ];

  function getPet(id) {
    for (var i = 0; i < PETS.length; i++) {
      if (PETS[i].id === id) return PETS[i];
    }
    return PETS[0];
  }

  function displayName(state) {
    if (state.petName && String(state.petName).trim()) {
      return String(state.petName).trim();
    }
    var p = getPet(state.petId);
    return p ? p.name : 'Friend';
  }

  function habitatDetails(stage) {
    stage = stage || 0;
    // Extra habitat props unlock with growth
    return {
      flowers: stage >= 1,
      birdbath: stage >= 2,
      lantern: stage >= 3,
      banner: stage >= 4
    };
  }

  /**
   * Return SVG markup string for a pet at a growth stage (0–4).
   * Original illustrations — cozy storybook style.
   */
  function renderPetSvg(petId, stage, opts) {
    opts = opts || {};
    stage = Math.max(0, Math.min(4, stage || 0));
    var scale = 0.72 + stage * 0.07;
    var accessory = '';
    if (stage >= 2) accessory = collarSvg(petId);
    if (stage >= 3) accessory += bowOrBandana(petId);
    if (stage >= 4) accessory += sparkleSvg();

    var body;
    if (petId === 'kitten') body = kittenSvg(stage);
    else if (petId === 'bunny') body = bunnySvg(stage);
    else if (petId === 'owl') body = owlSvg(stage);
    else body = puppySvg(stage);

    var title = opts.title ? '<title>' + escapeXml(opts.title) + '</title>' : '';
    var mood = opts.mood === 'happy' || opts.mood === 'cheer' ? opts.mood : 'calm';
    return (
      '<svg class="pet-svg mood-' + mood + '" viewBox="0 0 200 200" width="100%" height="100%" role="img" aria-label="' +
      escapeXml(opts.label || petId) +
      '">' +
      title +
      '<g transform="translate(100 110) scale(' +
      scale.toFixed(3) +
      ') translate(-100 -110)">' +
      body +
      accessory +
      moodLayer(mood) +
      '</g></svg>'
    );
  }

  function moodLayer(mood) {
    if (mood === 'happy') {
      return (
        '<ellipse cx="78" cy="112" rx="8" ry="4.5" fill="#f0a090" opacity="0.7"/>' +
        '<ellipse cx="122" cy="112" rx="8" ry="4.5" fill="#f0a090" opacity="0.7"/>' +
        '<path d="M88 118 Q100 132 112 118" fill="none" stroke="#5c4030" stroke-width="2.4" stroke-linecap="round"/>' +
        '<g fill="#e8c84a">' +
        '<circle cx="46" cy="64" r="2.4"/>' +
        '<circle cx="156" cy="70" r="2"/>' +
        '<circle cx="150" cy="132" r="2.2"/>' +
        '</g>'
      );
    }
    if (mood === 'cheer') {
      return (
        '<ellipse cx="78" cy="112" rx="7" ry="4" fill="#f0a090" opacity="0.45"/>' +
        '<ellipse cx="122" cy="112" rx="7" ry="4" fill="#f0a090" opacity="0.45"/>' +
        '<path d="M92 120 Q100 126 108 120" fill="none" stroke="#5c4030" stroke-width="2" stroke-linecap="round"/>'
      );
    }
    return '';
  }

  function escapeXml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function puppySvg(stage) {
    var earTilt = stage >= 2 ? '-8' : '0';
    return (
      '<ellipse cx="100" cy="145" rx="48" ry="18" fill="#d4c4a8" opacity="0.45"/>' +
      '<ellipse cx="100" cy="120" rx="42" ry="36" fill="#e8c49a"/>' +
      '<ellipse cx="100" cy="118" rx="36" ry="30" fill="#f0d2ad"/>' +
      '<ellipse cx="78" cy="78" rx="18" ry="22" fill="#e8c49a" transform="rotate(-18 78 78)"/>' +
      '<ellipse cx="122" cy="78" rx="18" ry="22" fill="#e8c49a" transform="rotate(' + earTilt + ' 122 78)"/>' +
      '<ellipse cx="78" cy="80" rx="10" ry="14" fill="#c4784a" transform="rotate(-18 78 80)"/>' +
      '<ellipse cx="122" cy="80" rx="10" ry="14" fill="#c4784a" transform="rotate(' + earTilt + ' 122 80)"/>' +
      '<circle cx="100" cy="100" r="32" fill="#f3d7b3"/>' +
      '<circle cx="88" cy="98" r="4" fill="#3d2c1e"/>' +
      '<circle cx="112" cy="98" r="4" fill="#3d2c1e"/>' +
      '<ellipse cx="100" cy="110" rx="8" ry="6" fill="#5c4030"/>' +
      '<path d="M92 116 Q100 122 108 116" fill="none" stroke="#5c4030" stroke-width="2" stroke-linecap="round"/>' +
      (stage >= 1
        ? '<circle cx="72" cy="108" r="7" fill="#f0a090" opacity="0.55"/><circle cx="128" cy="108" r="7" fill="#f0a090" opacity="0.55"/>'
        : '') +
      '<ellipse cx="70" cy="140" rx="10" ry="8" fill="#e8c49a"/>' +
      '<ellipse cx="130" cy="140" rx="10" ry="8" fill="#e8c49a"/>' +
      '<path d="M140 118 Q158 100 150 130" fill="none" stroke="#c4784a" stroke-width="8" stroke-linecap="round"/>'
    );
  }

  function kittenSvg(stage) {
    return (
      '<ellipse cx="100" cy="148" rx="40" ry="14" fill="#d4c4a8" opacity="0.4"/>' +
      '<ellipse cx="100" cy="125" rx="38" ry="32" fill="#d9cfc0"/>' +
      '<polygon points="72,78 68,48 90,72" fill="#d9cfc0"/>' +
      '<polygon points="128,78 132,48 110,72" fill="#d9cfc0"/>' +
      '<polygon points="74,74 72,54 86,70" fill="#e8b4b8"/>' +
      '<polygon points="126,74 128,54 114,70" fill="#e8b4b8"/>' +
      '<circle cx="100" cy="100" r="30" fill="#e5ddd2"/>' +
      '<ellipse cx="88" cy="100" rx="5" ry="6" fill="#3a5a40"/>' +
      '<ellipse cx="112" cy="100" rx="5" ry="6" fill="#3a5a40"/>' +
      '<path d="M100 106 L96 114 L100 112 L104 114 Z" fill="#c4784a"/>' +
      '<path d="M88 118 Q100 124 112 118" fill="none" stroke="#7a6a5a" stroke-width="1.5"/>' +
      '<path d="M70 110 H55 M70 116 H52 M130 110 H145 M130 116 H148" stroke="#b0a090" stroke-width="1.5" stroke-linecap="round"/>' +
      (stage >= 1 ? '<path d="M100 125 Q90 140 100 148 Q110 140 100 125" fill="#cfc4b4"/>' : '') +
      '<ellipse cx="78" cy="145" rx="9" ry="7" fill="#d9cfc0"/>' +
      '<ellipse cx="122" cy="145" rx="9" ry="7" fill="#d9cfc0"/>'
    );
  }

  function bunnySvg(stage) {
    var earH = 42 + stage * 2;
    return (
      '<ellipse cx="100" cy="150" rx="36" ry="12" fill="#d4c4a8" opacity="0.4"/>' +
      '<ellipse cx="100" cy="128" rx="36" ry="30" fill="#f0e6d8"/>' +
      '<ellipse cx="82" cy="' + (78 - stage) + '" rx="10" ry="' + earH + '" fill="#f0e6d8"/>' +
      '<ellipse cx="118" cy="' + (78 - stage) + '" rx="10" ry="' + earH + '" fill="#f0e6d8"/>' +
      '<ellipse cx="82" cy="' + (80 - stage) + '" rx="5" ry="' + (earH - 10) + '" fill="#f0c4c8"/>' +
      '<ellipse cx="118" cy="' + (80 - stage) + '" rx="5" ry="' + (earH - 10) + '" fill="#f0c4c8"/>' +
      '<circle cx="100" cy="105" r="28" fill="#f7efe4"/>' +
      '<circle cx="90" cy="102" r="3.5" fill="#3d2c1e"/>' +
      '<circle cx="110" cy="102" r="3.5" fill="#3d2c1e"/>' +
      '<ellipse cx="100" cy="112" rx="5" ry="4" fill="#e8a0a8"/>' +
      '<path d="M100 116 L100 120 M94 120 H106" stroke="#5c4030" stroke-width="1.5" stroke-linecap="round"/>' +
      (stage >= 2
        ? '<circle cx="148" cy="130" r="10" fill="#f0e6d8"/><circle cx="148" cy="130" r="6" fill="#f7efe4"/>'
        : '') +
      '<ellipse cx="85" cy="148" rx="8" ry="6" fill="#f0e6d8"/>' +
      '<ellipse cx="115" cy="148" rx="8" ry="6" fill="#f0e6d8"/>'
    );
  }

  function owlSvg(stage) {
    return (
      '<ellipse cx="100" cy="150" rx="38" ry="12" fill="#d4c4a8" opacity="0.4"/>' +
      '<ellipse cx="100" cy="120" rx="40" ry="42" fill="#8a9aaa"/>' +
      '<ellipse cx="100" cy="122" rx="32" ry="34" fill="#a8b8c4"/>' +
      '<polygon points="70,70 78,48 92,72" fill="#8a9aaa"/>' +
      '<polygon points="130,70 122,48 108,72" fill="#8a9aaa"/>' +
      '<circle cx="86" cy="100" r="14" fill="#f5f0e8"/>' +
      '<circle cx="114" cy="100" r="14" fill="#f5f0e8"/>' +
      '<circle cx="86" cy="100" r="7" fill="#3d2c1e"/>' +
      '<circle cx="114" cy="100" r="7" fill="#3d2c1e"/>' +
      '<circle cx="88" cy="98" r="2" fill="#f5f0e8"/>' +
      '<circle cx="116" cy="98" r="2" fill="#f5f0e8"/>' +
      '<polygon points="100,110 94,120 106,120" fill="#d4a574"/>' +
      (stage >= 1
        ? '<path d="M75 130 Q100 145 125 130" fill="none" stroke="#6b7c8a" stroke-width="3"/>'
        : '') +
      (stage >= 2
        ? '<path d="M60 110 Q40 100 55 125" fill="#8a9aaa"/><path d="M140 110 Q160 100 145 125" fill="#8a9aaa"/>'
        : '')
    );
  }

  function collarSvg(petId) {
    var color = petId === 'owl' ? '#c9a227' : '#c4784a';
    return (
      '<rect x="78" y="128" width="44" height="6" rx="3" fill="' +
      color +
      '"/>' +
      '<circle cx="100" cy="136" r="4" fill="#e8c84a"/>'
    );
  }

  function bowOrBandana(petId) {
    if (petId === 'bunny' || petId === 'kitten') {
      return (
        '<path d="M118 72 L130 66 L128 78 Z" fill="#7a8f6a"/>' +
        '<path d="M118 72 L130 78 L124 84 Z" fill="#6a7f5a"/>'
      );
    }
    return '<path d="M70 125 L55 118 L58 132 Z" fill="#7a8f6a"/><path d="M70 125 L55 132 L62 118 Z" fill="#5f734f"/>';
  }

  function sparkleSvg() {
    return (
      '<g fill="#e8c84a" opacity="0.85">' +
      '<circle cx="48" cy="60" r="2.5"/>' +
      '<circle cx="155" cy="70" r="2"/>' +
      '<circle cx="160" cy="140" r="2.5"/>' +
      '</g>'
    );
  }

  function renderHabitatSvg(stage) {
    var d = habitatDetails(stage);
    var parts =
      '<svg class="habitat-svg" viewBox="0 0 360 200" width="100%" height="100%" aria-hidden="true">' +
      '<defs>' +
      '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="#f3e6c8"/>' +
      '<stop offset="100%" stop-color="#e6efdf"/>' +
      '</linearGradient>' +
      '</defs>' +
      '<rect width="360" height="200" fill="url(#sky)"/>' +
      '<ellipse cx="180" cy="190" rx="170" ry="40" fill="#c5d5b5"/>' +
      '<path d="M0 150 Q60 120 120 145 T240 140 T360 150 L360 200 L0 200 Z" fill="#b7c9a5"/>' +
      '<rect x="40" y="110" width="14" height="50" fill="#8b6b4a"/>' +
      '<circle cx="47" cy="100" r="28" fill="#7a9a68"/>' +
      '<rect x="300" y="120" width="12" height="40" fill="#8b6b4a"/>' +
      '<circle cx="306" cy="112" r="22" fill="#6f8f5e"/>';

    if (d.flowers) {
      parts +=
        '<g fill="#d4785a">' +
        '<circle cx="90" cy="160" r="5"/><circle cx="110" cy="155" r="4"/><circle cx="250" cy="158" r="5"/>' +
        '</g>' +
        '<g fill="#e8c84a"><circle cx="100" cy="168" r="3.5"/><circle cx="260" cy="165" r="3"/></g>';
    }
    if (d.birdbath) {
      parts +=
        '<ellipse cx="280" cy="155" rx="18" ry="6" fill="#9aa7b0"/>' +
        '<rect x="274" y="155" width="12" height="18" fill="#8a969e"/>' +
        '<ellipse cx="280" cy="153" rx="14" ry="4" fill="#b8d4e8"/>';
    }
    if (d.lantern) {
      parts +=
        '<rect x="150" y="100" width="8" height="22" rx="2" fill="#c9a227"/>' +
        '<rect x="146" y="94" width="16" height="10" rx="2" fill="#e8c84a" opacity="0.9"/>';
    }
    if (d.banner) {
      parts +=
        '<path d="M120 70 H200 L190 85 L200 100 H120 Z" fill="#c4784a" opacity="0.85"/>' +
        '<text x="160" y="90" text-anchor="middle" font-size="12" fill="#fff8e7" font-family="Georgia, serif">Home</text>';
    }

    parts += '</svg>';
    return parts;
  }

  return {
    PETS: PETS,
    STAGE_LABELS: STAGE_LABELS,
    getPet: getPet,
    displayName: displayName,
    habitatDetails: habitatDetails,
    renderPetSvg: renderPetSvg,
    renderHabitatSvg: renderHabitatSvg
  };
});
