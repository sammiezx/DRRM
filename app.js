/* ===========================================================
   DRRM for Civil Engineers — app
   Chassis ported from Vision: theme, drawer nav, scroll-spy,
   full-text search, MCQ engine, flashcards, offline SW.
   =========================================================== */
(function () {
'use strict';

var $  = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

/* ---------------- theme ---------------- */
var themeBtn = $('#themeBtn');
try {
  var savedTheme = localStorage.getItem('drrm-theme');
  if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);
} catch (e) {}
themeBtn.addEventListener('click', function () {
  var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem('drrm-theme', next); } catch (e) {}
});

/* ---------------- drawer nav ---------------- */
var body = document.body, toc = $('#toc'), scrim = $('#scrim'), menuBtn = $('#menuBtn');
function openNav()  { body.classList.add('nav-open');  menuBtn.setAttribute('aria-expanded', 'true'); }
function closeNav() { body.classList.remove('nav-open'); menuBtn.setAttribute('aria-expanded', 'false'); }
menuBtn.addEventListener('click', function () {
  body.classList.contains('nav-open') ? closeNav() : openNav();
});
$('#navClose').addEventListener('click', closeNav);
scrim.addEventListener('click', closeNav);
toc.addEventListener('click', function (e) {
  if (e.target.closest('a')) closeNav();
});

/* ---------------- back to top ---------------- */
var toTop = $('#toTop');
toTop.addEventListener('click', function () {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ---------------- lightbox ---------------- */
var lb = $('#lightbox'), lbImg = $('#lbImg');
document.addEventListener('click', function (e) {
  var im = e.target.closest('figure img');
  if (!im) return;
  lbImg.src = im.currentSrc || im.src;
  lbImg.alt = im.alt || '';
  lb.classList.add('on');
  // open centred on the slide, which is wider than the phone
  requestAnimationFrame(function () {
    lb.scrollLeft = Math.max(0, (lbImg.offsetWidth - lb.clientWidth) / 2);
    lb.scrollTop = 0;
  });
});
function closeLb() { lb.classList.remove('on'); lbImg.src = ''; }
lb.addEventListener('click', function (e) { if (e.target !== lbImg) closeLb(); });
var lbCloseBtn = $('#lbClose');
if (lbCloseBtn) lbCloseBtn.addEventListener('click', closeLb);

/* ---------------- progress + scroll spy + bar title ---------------- */
var pbar = $('#progress i'), barTitle = $('#barTitle');
var defaultTitle = barTitle.innerHTML;
var spyTargets = $$('section.part, h3.chap');
var navLinks = {};
$$('nav.toc a').forEach(function (a) { navLinks[a.getAttribute('href').slice(1)] = a; });
var ticking = false;

function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(function () {
    ticking = false;
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var y = h.scrollTop || window.pageYOffset;
    pbar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    toTop.classList.toggle('on', y > 900);

    var cur = null;
    for (var i = 0; i < spyTargets.length; i++) {
      if (spyTargets[i].getBoundingClientRect().top <= 110) cur = spyTargets[i];
      else break;
    }
    Object.keys(navLinks).forEach(function (k) { navLinks[k].classList.remove('active'); });
    if (cur && navLinks[cur.id]) {
      var link = navLinks[cur.id];
      link.classList.add('active');
      var lr = link.getBoundingClientRect(), nr = toc.getBoundingClientRect();
      if (lr.top < nr.top || lr.bottom > nr.bottom) link.scrollIntoView({ block: 'nearest' });
      if (cur.classList.contains('chap')) {
        var part = cur.closest('section.part');
        var pname = part ? part.querySelector('.part-banner h2').textContent : '';
        barTitle.innerHTML = '';
        barTitle.appendChild(document.createTextNode(cur.textContent.trim()));
        var s = document.createElement('small'); s.textContent = pname;
        barTitle.appendChild(s);
      }
    } else if (y < 400) {
      barTitle.innerHTML = defaultTitle;
    }

    if (cur) {
      var curPart = cur.closest ? cur.closest('section.part') : null;
      if (curPart && window.__syncAcc) window.__syncAcc(curPart.id);
      var bf = document.getElementById('bbFast');
      if (bf) bf.classList.toggle('on', !!curPart && curPart.id === 'p0');
    }

    var qs = $('#quizScore'), mcqSection = $('#mcqs');
    if (qs && mcqSection) {
      var r = mcqSection.getBoundingClientRect();
      qs.classList.toggle('on', r.top < window.innerHeight && r.bottom > 60);
    }
  });
}
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll, { passive: true });
onScroll();

/* ---------------- search ---------------- */
var searchPane = $('#searchPane'), searchBox = $('#search');
var searchMeta = $('#searchMeta'), searchResults = $('#searchResults');
var index = null;

function buildIndex() {
  if (index) return index;
  index = [];
  var main = $('main');
  var chapter = null, part = null;
  var walker = document.createTreeWalker(main, NodeFilter.SHOW_ELEMENT, null);
  var node;
  while ((node = walker.nextNode())) {
    if (node.tagName === 'H2' && node.closest('.part-banner')) { part = node.textContent.trim(); continue; }
    if (node.tagName === 'H3' && node.classList.contains('chap')) { chapter = node; continue; }
    if (/^(P|LI|TD|TH|H4|H5|FIGCAPTION|CAPTION)$/.test(node.tagName)) {
      if (node.querySelector('p,li,td,h4,h5')) continue;
      var txt = node.textContent.replace(/\s+/g, ' ').trim();
      if (txt.length < 12) continue;
      index.push({
        t: txt,
        lc: txt.toLowerCase(),
        id: chapter ? chapter.id : (node.closest('section.part') || {}).id,
        c: chapter ? chapter.textContent.trim() : (part || '')
      });
    }
  }
  return index;
}

function escapeHtml(s) {
  return s.replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  });
}

function snippet(text, lcText, q) {
  var i = lcText.indexOf(q);
  if (i < 0) return escapeHtml(text.slice(0, 150));
  var start = Math.max(0, i - 55), end = Math.min(text.length, i + q.length + 95);
  var out = (start > 0 ? '…' : '') + text.slice(start, i) +
            '' + text.slice(i, i + q.length) + '' +
            text.slice(i + q.length, end) + (end < text.length ? '…' : '');
  return escapeHtml(out).replace('', '<b>').replace('', '</b>');
}

function runSearch(q) {
  q = q.trim().toLowerCase();
  searchResults.innerHTML = '';
  if (q.length < 2) {
    searchMeta.textContent = 'Type at least two letters. Try “debris flow”, “scour”, “bio-engineering”.';
    return;
  }
  var idx = buildIndex();
  var hits = [];
  for (var i = 0; i < idx.length && hits.length < 80; i++) {
    if (idx[i].lc.indexOf(q) >= 0) hits.push(idx[i]);
  }
  searchMeta.textContent = hits.length
    ? hits.length + (hits.length === 80 ? '+ passages' : ' passage' + (hits.length > 1 ? 's' : '')) + ' found'
    : 'Nothing found for “' + q + '”';
  var frag = document.createDocumentFragment();
  hits.forEach(function (h) {
    var a = document.createElement('a');
    a.className = 'sres';
    a.href = '#' + (h.id || '');
    a.innerHTML = '<span class="cx">' + escapeHtml(h.c) + '</span>' +
                  '<span class="sn">' + snippet(h.t, h.lc, q) + '</span>';
    a.addEventListener('click', closeSearch);
    frag.appendChild(a);
  });
  searchResults.appendChild(frag);
}

var searchTimer = null;
function openSearch() {
  body.classList.add('search-open');
  setTimeout(function () { searchBox.focus(); }, 60);
}
function closeSearch() { body.classList.remove('search-open'); }
$('#searchBtn').addEventListener('click', openSearch);
$('#searchClose').addEventListener('click', closeSearch);
searchBox.addEventListener('input', function () {
  clearTimeout(searchTimer);
  var v = searchBox.value;
  searchTimer = setTimeout(function () { runSearch(v); }, 180);
});
searchBox.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeSearch();
  if (e.key === 'Enter') {
    var first = searchResults.querySelector('.sres');
    if (first) first.click();
  }
});

/* ---------------- MCQ ---------------- */
var mcqs = $$('.mcq');
var answered = 0, correct = 0;
var scoreText = $('#scoreText');
function updateScore() {
  if (!scoreText) return;
  scoreText.textContent = answered
    ? answered + '/' + mcqs.length + ' · ' + correct + ' right (' + Math.round(correct / answered * 100) + '%)'
    : '0 of ' + mcqs.length + ' answered';
}
mcqs.forEach(function (box) {
  var ans = parseInt(box.dataset.a, 10);
  var opts = $$('.opt', box);
  opts.forEach(function (o, i) {
    o.setAttribute('data-o', 'ABCD'[i]);
    o.setAttribute('role', 'button');
    o.setAttribute('tabindex', '0');
    function choose() {
      if (box.classList.contains('done')) return;
      box.classList.add('done');
      answered++;
      if (i === ans) correct++;
      opts.forEach(function (x, j) {
        if (j === ans) x.classList.add('correct');
        else if (j === i) x.classList.add('wrong');
      });
      updateScore();
    }
    o.addEventListener('click', choose);
    o.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(); }
    });
  });
  var exp = $('.exp', box);
  if (exp) {
    var key = document.createElement('span');
    key.className = 'printonly';
    key.textContent = 'Answer: ' + 'ABCD'[ans] + ' — ' + opts[ans].textContent.trim() + '. ';
    exp.insertBefore(key, exp.firstChild);
  }
});
updateScore();
var resetBtn = $('#resetQuiz');
if (resetBtn) resetBtn.addEventListener('click', function () {
  answered = 0; correct = 0;
  mcqs.forEach(function (b) {
    b.classList.remove('done');
    $$('.opt', b).forEach(function (o) { o.classList.remove('correct', 'wrong'); });
  });
  updateScore();
  if (mcqs[0]) mcqs[0].scrollIntoView({ block: 'start', behavior: 'smooth' });
});

/* ---------------- deep annex ---------------- */
/* Printing must produce the whole document, not the collapsed version of it. */
(function () {
  var deeps = $$('details.deep');
  if (!deeps.length) return;
  var wasOpen = [];
  function openAll() {
    wasOpen = deeps.map(function (d) { return d.open; });
    deeps.forEach(function (d) { d.open = true; });
  }
  function restore() {
    deeps.forEach(function (d, i) { d.open = wasOpen[i]; });
  }
  if (window.matchMedia) {
    var mq = window.matchMedia('print');
    var onChange = function (e) { e.matches ? openAll() : restore(); };
    mq.addEventListener ? mq.addEventListener('change', onChange)
                        : mq.addListener && mq.addListener(onChange);
  }
  window.addEventListener('beforeprint', openAll);
  window.addEventListener('afterprint', restore);
})();

/* ---------------- check yourself ---------------- */
/* Answers stay blurred until tapped: he has to produce the answer before he
   sees it. Recognition is not recall, and the blur is what forces the difference. */
$$('.checkself .a').forEach(function (el) {
  el.setAttribute('role', 'button');
  el.setAttribute('tabindex', '0');
  el.setAttribute('aria-label', 'Reveal answer');
  function reveal() { el.classList.add('shown'); }
  el.addEventListener('click', reveal);
  el.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); reveal(); }
  });
});

/* ---------------- flashcard decks ---------------- */
const DECKS = {
  /* Cards are harvested from the written sessions, never invented separately.
     Acts III-V are added as those sessions are written. */
  "Definitions": [
    ["Factor of safety","Resisting force divided by driving force on an assumed failure surface. FoS = 1.0 means the slope IS moving, not that it is about to."],
    ["Effective stress","Total normal stress minus pore water pressure, (\u03c3 \u2212 u). Friction is mobilised by this, not by total stress \u2014 which is why rain weakens a slope without making it heavier."],
    ["Matric suction","Apparent cohesion from surface tension in partly saturated pores. Holds a cut face up through the dry season, and disappears entirely on saturation."],
    ["Debris flow","A moving mass in which the sediment IS the flow and water makes it mobile. Solids over half the volume; density roughly 1.8\u20132.3 t/m\u00b3."],
    ["Entrainment","A flow scouring the channel bed and banks as it travels, so the volume arriving at the fan can be many times what detached at the source."],
    ["Avulsion","A stream abandoning its channel and taking a new path across a fan. Predicted by a channel perched above the surrounding fan surface."],
    ["Rock mass","Blocks separated by discontinuities \u2014 not intact rock. What governs a cut is the orientation of those surfaces, not the strength of the rock."],
    ["Kinematic test","Asking whether a block can physically get out, given the joint geometry. If movement is not permitted, the failure mode is impossible regardless of strength."],
    ["Susceptibility","WHERE a landslide can occur \u2014 terrain only. No timing, no consequence. Not the same as hazard, and not remotely the same as risk."],
    ["Hazard (vs susceptibility)","Susceptibility plus magnitude and probability \u2014 where, how big, how often."],
    ["Risk","Hazard plus exposure and vulnerability. A steep uninhabited hillside has high susceptibility and no risk."]
  ],
  "Nepal events": [
    ["Jure landslide","2 August 2014, ~2:30 am, Sindhupalchok. Roughly 156 killed, Araniko Highway severed, and the Sunkoshi dammed \u2014 the landslide-dam outburst threat lasted weeks."],
    ["Melamchi","15 June 2021. A debris flow, not a flood \u2014 buried parts of Melamchi Bazar, took bridges, damaged the water supply headworks. The arriving event was out of all proportion to the rainfall."],
    ["Why the two differ","Jure was a rock slide: sudden, local, and it dammed a river. Melamchi was a debris flow: it travelled far beyond its source and rebuilt the valley floor as it went."]
  ],
  "Field indicators": [
    ["Tension cracks at the crown","The most reliable early sign \u2014 and also a cause, because an open crack drains surface water straight to the slip surface. Seal them and date them."],
    ["Trees tilted backwards into the slope","Rotational movement \u2014 the mass has rotated on a curved surface, tipping its upper part back."],
    ["Trees tilted downslope, or bent at the base","Translational movement or creep. The bend records ground moving while the tree kept growing vertically."],
    ["A spring that has moved, appeared or dried","The most diagnostic single sign. Movement disrupts internal drainage paths, so changed water means deformed ground."],
    ["A roadside drain that keeps silting for no reason","It is probably no longer level \u2014 toe heave from a slope moving beneath the road. A displacement symptom, not a maintenance failure."],
    ["Straight things that stopped being straight","Terraces, walls, channels, road crest. Humans build straight lines; the ground does not. A free displacement gauge somebody installed years ago."],
    ["Boulders larger than the present stream could move","Evidence of past debris flows, and a rough gauge of the magnitude to design for."],
    ["A stream perched above the fan surface","Aggrading and prone to avulsion. Today's channel is not where the next flow will go."],
    ["Talus block shape at a rock cut toe","Slabs point to planar sliding, triangular blocks to wedges, long columns to toppling. The ground has already run the analysis."]
  ],
  "Failure modes": [
    ["Fall","Detaches and travels through the air \u2014 no shear surface. Extremely fast. Often best managed by catching it, not preventing it."],
    ["Topple","Rotates forward about a point near its base. Steep joints dipping INTO the face \u2014 which is why it is the mode most often misread as favourable."],
    ["Slide","Coherent mass on one distinct shear surface. Rotational (curved) or translational (planar). The only family where a factor of safety means something."],
    ["Spread","A stiff layer breaks up and extends over a softer one beneath. Uncommon in Nepal's hills."],
    ["Flow","Moves as a fluid, shearing internally with no single surface. Travels furthest, kills most, and cannot be analysed by limit equilibrium."],
    ["Planar rock failure \u2014 three conditions","Joint dips out of the face and roughly parallel to it (within ~20\u00b0); dips less steeply than the face, so it daylights; dips more steeply than its friction angle, so it is driven."],
    ["Wedge failure","Two joint sets intersect and the block slides along the line of intersection. Easy to miss \u2014 neither set alone looks threatening."],
    ["Slide becoming flow","The commonest Nepali sequence. Classify by what it will be when it reaches your road, not by how it started at the crown."]
  ],
  "Numbers": [
    ["Debris flow density","Roughly 1.8\u20132.3 t/m\u00b3 against water's 1.0 \u2014 about twice the impact force at the same velocity, before any boulder strike."],
    ["Shallow vs deep-seated","Shallow is roughly under 3 m. It responds to rainfall intensity within hours; deep-seated responds to accumulated rainfall over days to weeks."],
    ["Typical target factor of safety","About 1.5 for permanent slopes where the data is good; lower is accepted on temporary works. A 1.5 on a guessed water table is worth less than a 1.3 where the water is known."],
    ["Planar sliding \u2014 face parallelism","The joint must dip within about 20\u00b0 of the face direction."]
  ],
  "Standards & clauses": [
    ["Placeholder","Filled as Acts III\u2013V are written \u2014 DoR and DoLI standards, NBC, and IRC where adopted."]
  ]
};

/* ---------------- flashcards ---------------- */
var fcDeck = $('#fcDeck'), fcard = $('#fcard');
var fcFront = $('#fcFront'), fcBack = $('#fcBack'), fcCount = $('#fcCount');
var curDeck = [], curIdx = 0;

Object.keys(DECKS).forEach(function (k) {
  var o = document.createElement('option');
  o.value = k; o.textContent = k + ' (' + DECKS[k].length + ')';
  fcDeck.appendChild(o);
});
var total = Object.keys(DECKS).reduce(function (a, k) { return a + DECKS[k].length; }, 0);
var allOpt = document.createElement('option');
allOpt.value = '__all__'; allOpt.textContent = 'All cards (' + total + ')';
fcDeck.appendChild(allOpt);

function loadDeck(name) {
  if (name === '__all__') {
    curDeck = [];
    Object.keys(DECKS).forEach(function (k) { curDeck = curDeck.concat(DECKS[k]); });
  } else {
    curDeck = DECKS[name].slice();
  }
  curIdx = 0; showCard();
}
function showCard() {
  if (!curDeck.length) return;
  var wasFlipped = fcard.classList.contains('flip');
  fcard.classList.remove('flip');
  setTimeout(function () {
    fcFront.textContent = curDeck[curIdx][0];
    fcBack.textContent = curDeck[curIdx][1];
  }, wasFlipped ? 200 : 0);
  fcCount.textContent = (curIdx + 1) + ' / ' + curDeck.length;
}
function nextCard() { curIdx = (curIdx + 1) % curDeck.length; showCard(); }
function prevCard() { curIdx = (curIdx - 1 + curDeck.length) % curDeck.length; showCard(); }

fcDeck.addEventListener('change', function () { loadDeck(fcDeck.value); });
fcard.addEventListener('click', function () { fcard.classList.toggle('flip'); });
fcard.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fcard.classList.toggle('flip'); }
});
$('#fcNext').addEventListener('click', nextCard);
$('#fcPrev').addEventListener('click', prevCard);
$('#fcShuffle').addEventListener('click', function () {
  for (var i = curDeck.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = curDeck[i]; curDeck[i] = curDeck[j]; curDeck[j] = t;
  }
  curIdx = 0; showCard();
});

/* swipe */
var tx = 0, ty = 0, moved = false;
fcard.addEventListener('touchstart', function (e) {
  tx = e.changedTouches[0].clientX; ty = e.changedTouches[0].clientY; moved = false;
}, { passive: true });
fcard.addEventListener('touchend', function (e) {
  var dx = e.changedTouches[0].clientX - tx;
  var dy = e.changedTouches[0].clientY - ty;
  if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) {
    moved = true;
    dx < 0 ? nextCard() : prevCard();
  }
}, { passive: true });
fcard.addEventListener('click', function (e) { if (moved) { moved = false; e.stopPropagation(); } }, true);

loadDeck(fcDeck.value);

var fcBtn = $('#fcBtn');
fcBtn.addEventListener('click', function () {
  var on = body.classList.toggle('fcmode');
  fcBtn.setAttribute('aria-label', on ? 'Back to the book' : 'Flashcards');
  barTitle.innerHTML = on ? 'Flashcards<small>Tap a card to flip</small>' : defaultTitle;
  window.scrollTo(0, 0);
});


/* ---------------- bottom bar ---------------- */
var bbToc = $('#bbToc'), bbSearch = $('#bbSearch'), bbCards = $('#bbCards'), bbFast = $('#bbFast');
if (bbToc)    bbToc.addEventListener('click', function () {
  body.classList.contains('nav-open') ? closeNav() : openNav();
});
if (bbSearch) bbSearch.addEventListener('click', openSearch);
if (bbFast)   bbFast.addEventListener('click', function () {
  if (body.classList.contains('fcmode')) fcBtn.click();
  var el = document.getElementById('p0');
  if (el) el.scrollIntoView();
});
if (bbCards)  bbCards.addEventListener('click', function () { fcBtn.click(); });

/* ---------------- accordion contents ---------------- */
/* Only the part you are in shows its chapters, so the drawer is short enough to scan. */
var topLis = $$('nav.toc > ol > li');
topLis.forEach(function (li) {
  var a = li.querySelector(':scope > a');
  var sub = li.querySelector(':scope > ul');
  if (!a || !sub) return;
  a.addEventListener('click', function (e) {
    // on a phone, first tap opens the group; a second tap on the same link navigates
    if (window.matchMedia('(min-width:900px)').matches) return;
    if (!li.classList.contains('open')) {
      e.preventDefault();
      topLis.forEach(function (o) { o.classList.remove('open'); });
      li.classList.add('open');
    }
  });
});
window.__syncAcc = syncAccordion;
function syncAccordion(partId) {
  if (window.matchMedia('(min-width:900px)').matches) return;
  topLis.forEach(function (li) {
    var a = li.querySelector(':scope > a');
    li.classList.toggle('open', !!a && a.getAttribute('href') === '#' + partId);
  });
}

/* ---------------- chapter stepper ---------------- */
/* Prev / next links at the foot of every chapter, so the drawer is rarely needed. */
(function buildSteppers() {
  var chaps = $$('h3.chap').filter(function (h) { return h.id; });
  chaps.forEach(function (h, i) {
    var prev = chaps[i - 1], next = chaps[i + 1];
    if (!prev && !next) return;
    var stop = h.nextElementSibling;
    var last = h;
    while (stop && !(stop.tagName === 'H3' && stop.classList.contains('chap'))) {
      last = stop; stop = stop.nextElementSibling;
    }
    var nav = document.createElement('div');
    nav.className = 'stepper';
    function link(t, dir, cls) {
      var a = document.createElement('a');
      a.className = cls; a.href = '#' + t.id;
      a.innerHTML = '<span class="dir">' + dir + '</span>' +
                    '<span class="ttl">' + t.textContent.trim().replace(/[<>&]/g, '') + '</span>';
      return a;
    }
    if (prev) nav.appendChild(link(prev, '← Previous', 'prev'));
    if (next) nav.appendChild(link(next, 'Next →', 'next'));
    if (last && last.parentNode) last.parentNode.insertBefore(nav, last.nextSibling);
  });
})();

/* ---------------- edge swipe opens contents ---------------- */
var eStartX = 0, eStartY = 0, edge = false;
document.addEventListener('touchstart', function (e) {
  var t = e.changedTouches[0];
  eStartX = t.clientX; eStartY = t.clientY;
  edge = eStartX < 24 && !body.classList.contains('nav-open');
}, { passive: true });
document.addEventListener('touchend', function (e) {
  if (!edge) return;
  edge = false;
  var t = e.changedTouches[0];
  if (t.clientX - eStartX > 60 && Math.abs(t.clientY - eStartY) < 50) openNav();
}, { passive: true });

/* ---------------- keyboard ---------------- */
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    if (lb.classList.contains('on')) { lb.classList.remove('on'); return; }
    if (body.classList.contains('search-open')) { closeSearch(); return; }
    if (body.classList.contains('nav-open')) { closeNav(); return; }
  }
  var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
  if (typing) return;
  if (e.key === '/') { e.preventDefault(); openSearch(); return; }
  if (body.classList.contains('fcmode')) {
    if (e.key === 'ArrowRight') nextCard();
    else if (e.key === 'ArrowLeft') prevCard();
    else if (e.key === ' ') { e.preventDefault(); fcard.classList.toggle('flip'); }
  }
});

/* ---------------- offline ---------------- */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  });
}

})();
