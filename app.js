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

/* ---------------- progress, start panel, contents states ---------------- */
/* Reading state lives on his phone and nowhere else. No account, no server. */
var PKEY = 'drrm-progress';
var prog = { read: {}, last: null };
try { prog = JSON.parse(localStorage.getItem(PKEY)) || prog; } catch (e) {}
if (!prog.read) prog.read = {};
function saveProg() { try { localStorage.setItem(PKEY, JSON.stringify(prog)); } catch (e) {} }

/* Every session heading, in document order, with whether it is written yet. */
var SESSIONS = $$('h3.chap').filter(function (h) { return /^s\d+$/.test(h.id); })
  .map(function (h) {
    return {
      id: h.id,
      el: h,
      title: h.textContent.trim(),
      pending: h.classList.contains('pending'),
      act: h.closest('section.part')
    };
  });
var READY = SESSIONS.filter(function (x) { return !x.pending; });

function readCount() {
  return READY.filter(function (x) { return prog.read[x.id]; }).length;
}

/* Mark a session read once its Check yourself block comes into view — that is
   the end of the session, so reaching it means he actually got through it. */
if (window.IntersectionObserver) {
  var io = new IntersectionObserver(function (entries) {
    var changed = false;
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var h = en.target.closest('section.part') && en.target.getAttribute('data-for');
      if (h && !prog.read[h]) { prog.read[h] = 1; changed = true; }
    });
    if (changed) { saveProg(); paintPanel(); paintToc(); }
  }, { rootMargin: '0px 0px -25% 0px' });
  READY.forEach(function (x) {
    var el = x.el.nextElementSibling, stop = null;
    while (el && !(el.tagName === 'H3' && el.classList.contains('chap'))) {
      if (el.classList && el.classList.contains('checkself')) { stop = el; break; }
      el = el.nextElementSibling;
    }
    if (stop) { stop.setAttribute('data-for', x.id); io.observe(stop); }
  });
}

/* Contents drawer: show what is ready, what is read, and how far each act is. */
function paintToc() {
  SESSIONS.forEach(function (x) {
    var a = toc.querySelector('a[href="#' + x.id + '"]');
    if (!a) return;
    a.classList.toggle('pend', x.pending);
    a.classList.toggle('done', !x.pending && !!prog.read[x.id]);
  });
  $$('nav.toc > ol > li').forEach(function (li) {
    var a = li.querySelector(':scope > a');
    if (!a) return;
    var href = a.getAttribute('href');
    var sec = href && document.querySelector(href);
    if (!sec) return;
    var mine = SESSIONS.filter(function (x) { return x.act === sec; });
    if (!mine.length) return;
    var ready = mine.filter(function (x) { return !x.pending; }).length;
    var cnt = a.querySelector('.cnt');
    if (!cnt) { cnt = document.createElement('span'); cnt.className = 'cnt'; a.appendChild(cnt); }
    cnt.textContent = ready ? ready + '/' + mine.length : '';
  });
}

/* The panel under the cover: where to start, and where he left off. */
var spActs = $('#spActs'), spCount = $('#spCount'), spContinue = $('#spContinue');

function nextUnread() {
  var unread = READY.filter(function (x) { return !prog.read[x.id]; });
  if (unread.length) return unread[0];
  return READY.length ? READY[READY.length - 1] : null;
}

function paintPanel() {
  if (!spActs) return;
  spActs.innerHTML = '';
  $$('main section.part').forEach(function (sec) {
    var mine = SESSIONS.filter(function (x) { return x.act === sec; });
    if (!mine.length) return;
    var banner = sec.querySelector('.part-banner');
    var k = banner && banner.querySelector('.k');
    var h2 = banner && banner.querySelector('h2');
    var ready = mine.filter(function (x) { return !x.pending; });
    var read = ready.filter(function (x) { return prog.read[x.id]; }).length;

    var li = document.createElement('li');
    if (!ready.length) li.className = 'none';
    var a = document.createElement('a');
    a.href = '#' + sec.id;
    a.innerHTML =
      '<span class="num">' + (k ? k.textContent.replace(/^Act\s*/, '') : '') + '</span>' +
      '<span class="txt"><span class="t"></span><span class="m"></span></span>' +
      '<span class="bar"><i></i></span>';
    a.querySelector('.t').textContent = h2 ? h2.textContent : sec.id;
    a.querySelector('.m').textContent = ready.length
      ? mine.length + ' sessions · ' + ready.length + ' ready' + (read ? ' · ' + read + ' read' : '')
      : mine.length + ' sessions · being written';
    a.querySelector('.bar i').style.width =
      (ready.length ? Math.round(read / ready.length * 100) : 0) + '%';
    li.appendChild(a);
    spActs.appendChild(li);
  });

  if (spCount) {
    spCount.innerHTML = '<b>' + SESSIONS.length + ' sessions</b> in five acts · <b>' +
      READY.length + '</b> written so far · you have read <b>' + readCount() + '</b>';
  }
  if (spContinue) {
    var nx = nextUnread();
    if (nx) {
      spContinue.hidden = false;
      spContinue.innerHTML = '<span class="lbl2">' +
        (readCount() ? 'Continue' : 'Start reading') + '</span> ' + nx.title;
      spContinue.onclick = function () { location.hash = '#' + nx.id; };
    } else {
      spContinue.hidden = true;
    }
  }
}
/* An act with nothing written yet should look like it. */
$$('main section.part').forEach(function (sec) {
  var mine = SESSIONS.filter(function (x) { return x.act === sec; });
  var banner = sec.querySelector('.part-banner');
  if (!banner) return;
  var anyReady = mine.some(function (x) { return !x.pending; });
  if (!mine.length) {
    // Fast Track and the Practice Kit hold no sessions; judge them by their own content
    anyReady = !sec.querySelector('.pendingnote');
  }
  banner.classList.toggle('is-pending', !anyReady);
});

paintToc();
paintPanel();

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
  /* Harvested from the written sessions \u2014 never invented separately. */
  "Definitions": [
    ["Factor of safety","Resisting force \u00f7 driving force on an assumed failure surface. FoS = 1.0 means the slope IS moving, not that it is about to."],
    ["Effective stress","\u03c3 \u2212 u. Friction is mobilised by this, not by total stress \u2014 which is why rain weakens a slope without making it heavier."],
    ["Matric suction","Apparent cohesion from surface tension in partly saturated pores. Holds a cut face up through the dry season, and vanishes on saturation."],
    ["Debris flow","A moving mass in which the sediment IS the flow and water makes it mobile. Density roughly 1.8\u20132.3 t/m\u00b3."],
    ["Entrainment","A flow scouring bed and banks as it travels, so what arrives at the fan can be many times what detached at the source."],
    ["Avulsion","A river abandoning its channel for a lower path. A breach mechanism, not a capacity failure \u2014 the Koshi, 2008."],
    ["Aggradation vs degradation","Aggradation: supply exceeds capacity, bed rises, waterway shrinks. Degradation: capacity exceeds supply, bed falls, foundations are undermined."],
    ["Time of concentration","Time for runoff from the most remote point to reach the outlet. The critical storm has duration equal to it."],
    ["Contraction scour","Bed lowering caused by YOUR structure narrowing the waterway. The scour component you control directly."],
    ["Launching apron","Sacrificial stone laid flat beyond the toe, designed to slide into the developing scour hole and armour it. Moving is its function."],
    ["Outflanking","The river going round the END of protective works. The second great killer after toe scour."],
    ["Non-stationarity","The flood distribution itself changing, so a historic record no longer describes the future."],
    ["Mass balance","Matching cut to fill along an alignment so there is no spoil to dispose of. The core Green Road principle."],
    ["Dormant landslide","Has moved before under conditions that still exist. The most dangerous activity state, because it looks like ordinary stable ground."],
    ["Susceptibility vs hazard vs risk","Susceptibility: WHERE, terrain only. Hazard: adds magnitude and probability. Risk: adds exposure and vulnerability."],
    ["Soft storey","Open ground floor beneath infilled floors, so all seismic drift concentrates in one level. The most lethal configuration defect in Nepal."],
    ["Unseating","A span displacing off its bearing \u2014 the dominant seismic collapse mechanism for simply supported bridges. Seat width and restrainers prevent it."]
  ],
  "Nepal events": [
    ["Jure landslide","2 August 2014, Sindhupalchok. ~156 killed, Araniko Highway severed, and it dammed the Sunkoshi \u2014 the outburst threat lasted weeks."],
    ["Melamchi","15 June 2021. A debris flow, not a flood. What arrived was out of all proportion to the rainfall, because the flow grew as it travelled."],
    ["Koshi avulsion","18 August 2008, at Kusaha. The river left its course at a discharge WELL BELOW barrage capacity \u2014 aggradation had perched the bed and the embankment breached."],
    ["Dig Tsho GLOF","4 August 1985. Destroyed the nearly complete Thame hydropower plant, bridges and trails. No rain, no warning."],
    ["Thame GLOF","August 2024. The same valley again \u2014 the hazard source population is growing as glaciers retreat."],
    ["Gorkha earthquake","25 April 2015, M7.8, ~9,000 dead. Triggered on the order of 25,000 landslides, and did NOT release the locked segment to the west."],
    ["Bihar\u2013Nepal earthquake","15 January 1934, ~M8.0, ~10,000 dead. Larger than 2015 \u2014 so 7.8 is not the maximum this system produces."],
    ["Jajarkot earthquake","3 November 2023, ~M6.4, ~150 dead. Lethal largely because of mud-mortar stone housing without bands or through-stones."],
    ["The 1505 gap","Far-western Nepal has no great earthquake in the record since 1505. Five centuries of convergence, stored."]
  ],
  "Field indicators": [
    ["Tension cracks at the crown","The most reliable early sign \u2014 and also a cause, because an open crack drains surface water straight to the slip surface. Seal and date them."],
    ["Trees tilted back into the slope","Rotational movement. Downslope tilt, or bent at the base with a straight upper trunk, means translational movement or creep."],
    ["A spring that moved, appeared or dried","The most diagnostic single sign. Movement disrupts internal drainage, so changed water means deformed ground."],
    ["A drain that keeps silting for no reason","It is probably no longer level \u2014 toe heave beneath the road. A displacement symptom, not a maintenance failure."],
    ["Straight things that stopped being straight","Terraces, walls, channels, road crest. A free displacement gauge somebody installed years ago."],
    ["Boulders the present stream could not move","Evidence of past debris flows, and a rough gauge of the magnitude to design for."],
    ["A stream perched above its fan","Aggrading and prone to avulsion. Today's channel is not where the next flow will go."],
    ["Talus block shape at a rock cut","Slabs \u2192 planar sliding. Triangular blocks \u2192 wedges. Long columns \u2192 toppling. The ground has already run the analysis."],
    ["Damp patch and settlement over a culvert","Piping \u2014 water tracking along the OUTSIDE of the barrel, carrying fines. Serious and frequently missed."],
    ["Failures clustered near drain outlets","The fingerprint of a manufactured problem. A natural hazard has no reason to prefer your outlets."],
    ["Scour hole below a culvert outlet","No apron, or a failed one. It erodes headward, undermines the outlet and then takes the embankment."]
  ],
  "Failure modes": [
    ["Fall","Detaches and travels through the air \u2014 no shear surface. Often best managed by catching it, not preventing it."],
    ["Topple","Rotates forward about its base. Steep joints dipping INTO the face \u2014 which is why it is misread as favourable."],
    ["Slide","Coherent mass on one shear surface. The only family where a factor of safety means anything."],
    ["Flow","Shears internally throughout, no single surface. Travels furthest, kills most, cannot be analysed by limit equilibrium."],
    ["Planar rock failure \u2014 three conditions","Dips out of the face, within ~20\u00b0 of it; dips less steeply than the face so it daylights; dips more steeply than its friction angle so it is driven."],
    ["Wedge failure","Two joint sets intersecting; the block slides along the line of intersection. Neither set alone looks threatening."],
    ["Slide becoming flow","The commonest Nepali sequence. Classify by what it will BE when it reaches your road, not by how it started."],
    ["Gabion wall lying tilted in the river, intact","The wall did not fail \u2014 the bed beneath it did. Toe undermining, the standard bank protection failure."],
    ["Wall founded above the slip surface","A passenger. It will be carried along with everything else. A 4 m wall on a 15 m slide is decoration."],
    ["Short column","Shortened by partial infill, so stiffer, attracts more force, and has less height to deform over. Fails in brittle shear."],
    ["Approach embankment loss","The most-lost bridge element. Outflanking, overtopping and breach, or a settlement step that stops traffic."]
  ],
  "Numbers": [
    ["Kirpich","t\u1d9c = 0.0195 L^0.77 S^\u22120.385. Minutes, metres, slope as a ratio. Hill kholas come out at 10\u201330 minutes."],
    ["Rational method","Q = 0.278 C I A. Q m\u00b3/s, I in mm/hr AT DURATION t\u1d9c, A in km\u00b2."],
    ["Risk of exceedance","1 \u2212 (1 \u2212 1/T)\u207f. T=50 over 50 years = 64%. More likely than not."],
    ["Lacey regime scour","d\u209b\u2098 = 1.34 (q\u00b2/f)^(1/3), below HFL. Note d\u209b\u2098 \u221d q^(2/3) \u2014 narrowing the waterway costs you at the two-thirds power."],
    ["Silt factor","f = 1.76 \u221ad\u2085\u2080, with d\u2085\u2080 IN MILLIMETRES. The commonest units slip in the whole calculation."],
    ["Pier nose scour factor","2.0 \u00d7 d\u209b\u2098. Straight reach 1.27, severe bend 1.75. Read from the current code, not from memory."],
    ["Well foundation grip","At least one third of the maximum scour depth below HFL, taken below max scour level."],
    ["Debris raft effect","Local scour \u221d pier width^0.65. A 3\u00d7 effective width roughly DOUBLES local scour (\u00d72.04)."],
    ["Debris flow density","~1.8\u20132.3 t/m\u00b3 against water's 1.0 \u2014 about twice the impact force at the same velocity, before boulders."],
    ["Shallow vs deep-seated","~3 m. Shallow responds to rainfall intensity in hours; deep-seated to accumulation over days to weeks."],
    ["Root zone depth","~0.5\u20131.5 m for grasses and shrubs. Below it, bio-engineering reaches nothing."],
    ["India\u2013Tibet convergence","~18\u201320 mm/yr, locked on the Main Himalayan Thrust."],
    ["Monsoon concentration","~80% of annual rainfall in four months, June to September."]
  ],
  "Standards & clauses": [
    ["DRRM Act 2074 (2017)","The disaster framework. Created NDRRMA and committees at national, province, district (DDMC) and local (LDMC) level."],
    ["Local Government Operation Act 2074","Devolved local infrastructure \u2014 the reason most new hill road length is now decided in a rural municipality office."],
    ["Nepal Rural Road Standard","Governs the local road network, which is most hill track construction. The least-opened document that matters most."],
    ["Nepal Road Standard / DoR standards","Strategic Road Network geometry, plus DoR bridge standards with IRC codes as adopted."],
    ["Environment Protection Act, IEE and EIA","The formal hook on which spoil disposal, drainage and slope obligations actually hang. The paperwork with teeth."],
    ["NBC 105 : 2020","Seismic design of buildings in Nepal, substantially revised from the 1994 edition. Always ask WHICH EDITION a design used."],
    ["Mandatory Rules of Thumb","Buildable rules \u2014 member sizes, reinforcement, wall lengths \u2014 for small buildings without an engineer's analysis."],
    ["Masonry rules that save lives","Bands at plinth, sill, LINTEL and roof; corner reinforcement; through-stones; gable band; limits on wall length and openings."],
    ["The edition rule","Every standard here is revised. Cite edition and date. An argument won with a superseded clause is a loss with a delay on it."]
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
var bbToc = $('#bbToc'), bbSearch = $('#bbSearch'), bbCards = $('#bbCards'), bbFast = $('#bbContinue');
if (bbToc)    bbToc.addEventListener('click', function () {
  body.classList.contains('nav-open') ? closeNav() : openNav();
});
if (bbSearch) bbSearch.addEventListener('click', openSearch);
if (bbFast)   bbFast.addEventListener('click', function () {
  if (body.classList.contains('fcmode')) fcBtn.click();
  var nx = nextUnread();
  if (nx) location.hash = '#' + nx.id;
  else window.scrollTo({ top: 0, behavior: 'smooth' });
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
/* When a new service worker takes over, the page is still running the old
   stylesheet and script. Reload once so the reader actually gets the update
   rather than silently keeping a stale copy. Guarded so the very first
   install — where there was no controller — does not cause a reload. */
if ('serviceWorker' in navigator) {
  var hadController = !!navigator.serviceWorker.controller;
  var reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (!hadController || reloading) return;
    reloading = true;
    window.location.reload();
  });
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('sw.js').then(function (reg) {
      reg.update();
    }).catch(function () {});
  });
}

})();
