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

var body = document.body;

/* ---------------- back to top ---------------- */
var toTop = $('#toTop');
toTop.setAttribute('aria-label', 'Top of this session');
toTop.addEventListener('click', function () {
  /* From 60,000 words in, the cover is rarely where you meant to go — and in
     standalone mode there is no browser back to undo it. */
  var h = lastPos && document.getElementById(lastPos.id);
  if (h) h.scrollIntoView({ behavior: 'smooth', block: 'start' });
  else window.scrollTo({ top: 0, behavior: 'smooth' });
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
var lastBarT = null;
var lastPos = null;
var defaultTitle = barTitle.innerHTML;
var spyTargets = $$('section.part, h3.chap');
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
    if (cur) {
      var t = '', sub = '';
      if (cur.classList.contains('chap')) {
        var part = cur.closest('section.part');
        var pb = part && part.querySelector('.part-banner');
        t = cur.textContent.trim();
        sub = pb && pb.querySelector('h2') ? pb.querySelector('h2').textContent : '';
      } else {
        /* A section banner — an act, the Fast Track, the Practice Kit or the
           Contents. One branch covers all of them; they all have banners. */
        var b = cur.querySelector('.part-banner');
        if (b) {
          t = b.querySelector('h2') ? b.querySelector('h2').textContent : '';
          sub = b.querySelector('.k') ? b.querySelector('.k').textContent : '';
        }
      }
      if (t && t !== lastBarT) {
        lastBarT = t;
        barTitle.innerHTML = '';
        barTitle.appendChild(document.createTextNode(t));
        if (sub) { var sm = document.createElement('small'); sm.textContent = sub; barTitle.appendChild(sm); }
      }
    } else if (lastBarT !== null) {
      lastBarT = null;
      barTitle.innerHTML = defaultTitle;
    }

    if (cur && cur.classList.contains('chap') && !body.classList.contains('fcmode')) {
      /* Store an offset from the heading rather than a raw pixel, so the place
         survives a reflow or a font change. */
      lastPos = { id: cur.id, dy: Math.round(-cur.getBoundingClientRect().top) };
    }

    if (cur) {
      var curPart = cur.closest ? cur.closest('section.part') : null;
      if (curPart && window.__syncAcc) window.__syncAcc(curPart.id);
      var bf = document.getElementById('bbContinue');
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
  var node, k = 0;
  while ((node = walker.nextNode())) {
    /* The generated contents page echoes every title in the book; without this
       the top hit for "culvert" was the contents row, bouncing you back to the
       page you searched from. */
    if (node.closest('#contentsList') || node.closest('#lookup')) continue;

    if (node.tagName === 'H2' && node.closest('.part-banner')) {
      part = node.textContent.trim();
      var sec = node.closest('section.part');
      if (sec) index.push({ t: part, lc: part.toLowerCase(), id: sec.id, sid: sec.id, c: 'Act', kind: 'title' });
      continue;
    }
    if (node.tagName === 'H3' && node.classList.contains('chap')) {
      chapter = node; k = 0;
      var ct = node.textContent.trim();
      index.push({ t: ct, lc: ct.toLowerCase(), id: node.id, sid: node.id, c: ct, kind: 'title' });
      continue;
    }
    if (node.tagName === 'H4') {
      var ht = node.textContent.replace(/\s+/g, ' ').trim();
      if (ht.length > 2) {
        if (!node.id && chapter) node.id = chapter.id + '-h' + (++k);
        index.push({ t: ht, lc: ht.toLowerCase(), id: node.id,
                     sid: chapter ? chapter.id : '', c: chapter ? chapter.textContent.trim() : (part || ''),
                     kind: 'title' });
      }
      continue;
    }
    if (/^(P|LI|TD|TH|H5|FIGCAPTION|CAPTION)$/.test(node.tagName)) {
      if (node.querySelector('p,li,td,h4,h5')) continue;
      var txt = node.textContent.replace(/\s+/g, ' ').trim();
      if (txt.length < 12) continue;
      /* Anchor the passage itself, so a hit lands on the sentence rather than
         at the top of a 1,400-word session. */
      var sid = chapter ? chapter.id : ((node.closest('section.part') || {}).id || '');
      if (!node.id && sid) node.id = sid + '-p' + (++k);
      index.push({
        t: txt, lc: txt.toLowerCase(),
        id: node.id || sid, sid: sid,
        c: chapter ? chapter.textContent.trim() : (part || ''),
        kind: 'passage'
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

function landOn(id) {
  var el = id && document.getElementById(id);
  if (!el) return;
  el.classList.add('flash');
  setTimeout(function () { el.classList.remove('flash'); }, 2400);
}

function runSearch(q) {
  q = q.trim().toLowerCase();
  searchResults.innerHTML = '';

  /* He thinks in session numbers; typing "22" used to full-text search 60,000
     words. */
  var num = /^\s*(\d{1,2})\s*$/.exec(q);
  if (num && +num[1] >= 1 && +num[1] <= 32) {
    location.hash = '#s' + num[1];
    closeSearch();
    return;
  }

  if (q.length < 2) {
    searchMeta.textContent = 'Type at least two letters — a word, or a session number.';
    return;
  }

  var idx = buildIndex();
  var titles = [], groups = {}, order = [], total = 0;
  for (var i = 0; i < idx.length; i++) {
    var h = idx[i];
    if (h.lc.indexOf(q) < 0) continue;
    total++;
    if (h.kind === 'title') { if (titles.length < 12) titles.push(h); continue; }
    if (!groups[h.sid]) { groups[h.sid] = { c: h.c, hits: [] }; order.push(h.sid); }
    groups[h.sid].hits.push(h);
  }

  searchMeta.textContent = total
    ? total + ' match' + (total > 1 ? 'es' : '') + ' in ' + (order.length || 1) + ' session' + (order.length > 1 ? 's' : '')
    : 'Nothing found for \u201c' + q + '\u201d';

  var frag = document.createDocumentFragment();

  function group(label) {
    var d = document.createElement('div');
    d.className = 'sgroup'; d.textContent = label;
    frag.appendChild(d);
  }
  function row(id, cx, body, extra) {
    var a = document.createElement('a');
    a.className = 'sres';
    a.href = '#' + (id || '');
    a.innerHTML = '<span class="cx">' + escapeHtml(cx) + (extra ? ' <b>' + extra + '</b>' : '') + '</span>' +
                  '<span class="sn">' + body + '</span>';
    a.addEventListener('click', function () { closeSearch(); setTimeout(function () { landOn(id); }, 60); });
    frag.appendChild(a);
  }

  if (titles.length) {
    group('Sessions and headings');
    titles.forEach(function (h) { row(h.id, h.c === h.t ? 'Session' : h.c, snippet(h.t, h.lc, q)); });
  }
  if (order.length) {
    group('Passages');
    order.forEach(function (sid) {
      var g = groups[sid], best = g.hits[0];
      row(best.id, g.c, snippet(best.t, best.lc, q),
          g.hits.length > 1 ? g.hits.length + ' matches' : '');
    });
  }
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

/* Write the position when the page is backgrounded rather than on every scroll
   frame — iOS kills background tabs without firing unload. */
document.addEventListener('visibilitychange', function () {
  if (document.hidden && lastPos) { prog.last = lastPos; saveProg(); }
});
window.addEventListener('pagehide', function () {
  if (lastPos) { prog.last = lastPos; saveProg(); }
});

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
    if (changed) { saveProg(); paintPanel(); paintContents(); }
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

/* ---------------- what each session is actually about ----------------
   The titles are deliberately memorable; these lines are deliberately plain.
   A reader scanning the contents has to be able to tell what is inside a
   session without opening it, and "The cascade" does not do that on its own. */
var ABOUT = {
  "s1":      "Nepal's earthquakes — why the far west is overdue, and why for a road it means landslides",
  "s2":      "Hazard, exposure, vulnerability, capacity — and which of them you can actually change",
  "s3":      "Geology, monsoon and uplift; the four belts from Terai to High Himalaya",
  "s4":      "DRRM Act 2074, NDRRMA, who owns which road, and which standard binds it",
  "s5":      "How one hazard triggers the next — landslide dams and outburst floods",
  "s6":      "Factor of safety and pore pressure — why slopes fail days after the rain stops",
  "s7":      "Fall, topple, slide, spread, flow — naming the mechanism, and why it decides the remedy",
  "s8":      "Why a debris flow is not a flood, how it grows, and how to read a debris fan",
  "s9":      "Six field signs of a moving slope, read from the crown downwards",
  "s10":     "How cutting, spoil tipping and drainage create the landslides we blame on rain",
  "s11":     "Rock cuts — joint orientation, and planar, wedge and toppling failure",
  "s12":     "Susceptibility, hazard and risk maps — what each one can and cannot tell you",
  "s13":     "Time of concentration and the rational method, for sizing cross-drainage",
  "s14":     "Choosing a design discharge and return period — and defending the number",
  "s15":     "Sediment, aggradation, braiding, bank erosion and channel migration",
  "s16":     "Three kinds of flood, three warning times — riverine, flash and GLOF",
  "s17":     "General, contraction and local scour; setting founding depth for a bridge",
  "s18":     "Spurs, revetments, guide bunds and launching aprons — and how they fail",
  "s19":     "Designing when the rainfall record no longer describes the catchment",
  "s20":     "Choosing the route — the largest risk decision on any hill road",
  "s21":     "Catch drains, side drains, turnouts and outlets — the four rules",
  "s22":     "Culverts, causeways and fords — sizing for debris, not only discharge",
  "s23":     "Gabion, dry stone and RCC walls — choosing one, and draining behind it",
  "s24":     "Vegetation as a structural material — what roots do, and where they stop",
  "s25":     "Labour-based hill road construction — mass balance and no side-tipping",
  "s26":     "Bridge scour, approach embankments, abutments, bearings and seat width",
  "s27":     "Comparing cheap against durable over twenty years, including closure cost",
  "s28":     "Network thinking — critical links, redundancy and time to reopen",
  "s29":     "Assessment, triage and temporary access in the days after a disaster",
  "s30":     "Load path, soft storey, NBC 105 and masonry rules — buildings in one session",
  "s31":     "Reconstruction after 2015, and the short window to change an alignment",
  "s32":     "Risk-sensitive land use, maintenance funding and local disaster funds",
  "pk1":     "Slope, drainage, culvert, bridge and day-one checklists for site use",
  "pk2":     "Every formula and number in the book, with its session and its source",
  "pk3":     "36 questions with explanations, covering all five acts",
  "pk4":     "Definitions and abbreviations used throughout",
  "pk5":     "Where to download every Act, standard and reference cited",
  "sources": "How this book was compiled, and what is study aid rather than code",
  "ft1":     "Act I in one card — the ground, and why risk is built",
  "ft2":     "Act II in one card — reading slopes and terrain",
  "ft3":     "Act III in one card — catchments, rivers, floods and scour",
  "ft4":     "Act IV in one card — alignment, drainage, walls and bridges",
  "ft5":     "Act V in one card — networks, response, recovery and land use"
};

/* ---------------- cross-references ----------------
   The book says "session 10" 144 times and never once tells the browser where
   that is. One text-node pass turns them into links. Two stages, because the
   obvious regex captures only the last number of a run: "sessions 6, 9 and 10"
   would link 10 alone. */
function linkSessionRefs() {
  var main = $('main');
  if (!main) return;
  var titles = {};
  SESSIONS.forEach(function (x) { titles[x.id] = x.title; });

  var walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, {
    acceptNode: function (n) {
      if (!/[Ss]essions?\s+\d/.test(n.nodeValue)) return NodeFilter.FILTER_REJECT;
      var p = n.parentElement;
      while (p && p !== main) {
        var t = p.tagName;
        if (t === 'A' || t === 'SCRIPT' || t === 'STYLE') return NodeFilter.FILTER_REJECT;
        if (t === 'H3' && p.classList.contains('chap')) return NodeFilter.FILTER_REJECT;
        if (p.classList && (p.classList.contains('sesstime') ||
                            p.id === 'contentsList' || p.id === 'lookup')) return NodeFilter.FILTER_REJECT;
        p = p.parentElement;
      }
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  var targets = [], n;
  while ((n = walker.nextNode())) targets.push(n);

  var RUN = /\b[Ss]essions?\s+\d{1,2}(?:\s*(?:,|and|&|to|\u2013|-)\s*\d{1,2})*/g;
  targets.forEach(function (node) {
    var text = node.nodeValue, out = document.createDocumentFragment(), last = 0, m;
    RUN.lastIndex = 0;
    while ((m = RUN.exec(text))) {
      if (m.index > last) out.appendChild(document.createTextNode(text.slice(last, m.index)));
      var phrase = m[0], inner = document.createDocumentFragment(), p2 = 0, d;
      var NUM = /\d{1,2}/g;
      var any = false;
      while ((d = NUM.exec(phrase))) {
        var num = parseInt(d[0], 10);
        if (num < 1 || num > 32) continue;
        if (d.index > p2) inner.appendChild(document.createTextNode(phrase.slice(p2, d.index)));
        var a = document.createElement('a');
        a.className = 'xref';
        a.href = '#s' + num;
        a.textContent = d[0];
        if (titles['s' + num]) a.title = titles['s' + num];
        inner.appendChild(a);
        p2 = d.index + d[0].length;
        any = true;
      }
      if (p2 < phrase.length) inner.appendChild(document.createTextNode(phrase.slice(p2)));
      out.appendChild(any ? inner : document.createTextNode(phrase));
      last = m.index + phrase.length;
    }
    if (last < text.length) out.appendChild(document.createTextNode(text.slice(last)));
    if (out.childNodes.length) node.parentNode.replaceChild(out, node);
  });
}

/* ---------------- the contents page ----------------
   Built from the document itself, so it lists every act, every session and
   every heading inside them, and can never drift out of step with the book. */
function buildContents() {
  var host = $('#contentsList');
  if (!host) return;
  host.innerHTML = '';

  /* A rail of act chips, sticky under the top bar. These are in-page anchors
     (#toc-a4) — a chip must move you within Contents, not eject you into the
     book. */
  var rail = document.createElement('nav');
  rail.className = 'tocjump-bar';
  rail.setAttribute('aria-label', 'Jump to an act');
  [['#lookup', 'By problem'], ['#toc-p0', 'Fast Track'],
   ['#toc-a1', 'I · Ground'], ['#toc-a2', 'II · Terrain'], ['#toc-a3', 'III · Water'],
   ['#toc-a4', 'IV · Road'], ['#toc-a5', 'V · Beyond'], ['#toc-pk', 'Practice Kit']
  ].forEach(function (p) {
    var a = document.createElement('a');
    a.href = p[0]; a.textContent = p[1];
    rail.appendChild(a);
  });
  host.appendChild(rail);

  $$('main section.part').forEach(function (sec) {
    if (sec.id === 'contents') return;

    var banner = sec.querySelector('.part-banner');
    var k  = banner && banner.querySelector('.k');
    var h2 = banner && banner.querySelector('h2');

    var block = document.createElement('section');
    block.className = 'toc-act';
    block.id = 'toc-' + sec.id;

    var head = document.createElement('a');
    head.className = 'toc-acthead';
    head.href = '#' + sec.id;
    head.innerHTML = '<span class="k"></span><span class="t"></span>';
    /* Some banners carry a sentence rather than a label; only short ones
       work as a chip here. */
    var kt = k ? k.textContent.trim() : '';
    head.querySelector('.k').textContent = kt.length <= 12 ? kt : '';
    head.querySelector('.t').textContent = h2 ? h2.textContent : sec.id;
    block.appendChild(head);

    /* How much is in here, and how long it takes — so an act can be chosen
       against the time actually available. */
    var mins = 0, count = 0;
    $$('h3.chap', sec).forEach(function (h) {
      count++;
      var m2 = h.nextElementSibling;
      if (m2 && m2.classList && m2.classList.contains('sesstime')) {
        var g = /(\d+)\s*min/.exec(m2.textContent);
        if (g) mins += parseInt(g[1], 10);
      }
    });
    if (count) {
      var n = document.createElement('span');
      n.className = 'n';
      n.textContent = count + (count === 1 ? ' session' : ' sessions') +
        (mins ? ' · ' + (mins >= 90 ? Math.round(mins / 60 * 10) / 10 + ' hours' : mins + ' min') : '');
      head.appendChild(n);
    }

    var list = document.createElement('ol');
    list.className = 'toc-list';

    /* Sessions and reference chapters are h3.chap. The Fast Track has no
       chapters — its five cards are .ft blocks — so fall back to those. */
    var items = $$('h3.chap', sec).map(function (h) { return { el: h, id: h.id, label: h.textContent.trim() }; });
    if (!items.length) {
      items = $$('.ft', sec).map(function (d) {
        var h4 = d.querySelector('.ft-h h4');
        var n  = d.querySelector('.ft-n');
        return { el: d, id: d.id,
                 label: (n ? n.textContent.trim() + ' · ' : '') + (h4 ? h4.textContent.trim() : d.id) };
      });
    }

    items.forEach(function (item) {
      var li = document.createElement('li');

      var a = document.createElement('a');
      a.className = 'toc-item';
      a.href = '#' + item.id;
      var t = document.createElement('span');
      t.className = 'toc-t';
      t.textContent = item.label;
      a.appendChild(t);
      if (ABOUT[item.id]) {
        var about = document.createElement('span');
        about.className = 'toc-about';
        about.textContent = ABOUT[item.id];
        a.appendChild(about);
      }
      var meta = item.el.nextElementSibling;
      if (meta && meta.classList && meta.classList.contains('sesstime')) {
        var mm = /(\d+)\s*min/.exec(meta.textContent);
        if (mm) {
          var mins = document.createElement('span');
          mins.className = 'toc-min';
          mins.textContent = mm[1] + ' min';
          a.insertBefore(mins, a.firstChild);
        }
      }
      if (item.el.classList && item.el.classList.contains('pending')) a.classList.add('pend');
      if (prog.read && prog.read[item.id]) a.classList.add('done');
      li.appendChild(a);

      /* The headings inside it — this is what makes the page usable rather
         than merely complete. Give them ids if the markup has none. */
      var subs = [], el = item.el.nextElementSibling, n = 0;
      while (el && !(el.tagName === 'H3' && el.classList.contains('chap'))) {
        if (el.tagName === 'H4') subs.push(el);
        el = el.nextElementSibling;
      }
      if (subs.length) {
        var ul = document.createElement('ul');
        ul.className = 'toc-subs';
        subs.forEach(function (h4) {
          if (!h4.id) h4.id = item.id + '-h' + (++n);
          var li2 = document.createElement('li');
          var a2 = document.createElement('a');
          a2.href = '#' + h4.id;
          a2.textContent = h4.textContent.trim();
          li2.appendChild(a2);
          ul.appendChild(li2);
        });
        var det = document.createElement('details');
        det.className = 'toc-parts';
        var sum = document.createElement('summary');
        sum.textContent = subs.length + ' parts inside';
        det.appendChild(sum);
        det.appendChild(ul);
        li.appendChild(det);
      }

      list.appendChild(li);
    });

    block.appendChild(list);
    host.appendChild(block);
  });
}

/* Repaint the read ticks without rebuilding the whole page. */
function paintContents() {
  if (!$('#contentsList')) return;
  SESSIONS.forEach(function (x) {
    var a = document.querySelector('#contentsList a.toc-item[href="#' + x.id + '"]');
    if (a) a.classList.toggle('done', !!prog.read[x.id]);
  });
}

/* The panel under the cover: where to start, and where he left off. */
var spActs = $('#spActs'), spCount = $('#spCount'), spContinue = $('#spContinue');

/* Three honest states: resuming where he stopped, starting the next unread
   session, or finished — in which case Continue should stop pretending and
   point at the reference half. */
function resumeTarget() {
  if (prog.last && prog.last.id && !prog.read[prog.last.id]) {
    var el = document.getElementById(prog.last.id);
    if (el) {
      var m = SESSIONS.filter(function (x) { return x.id === prog.last.id; })[0];
      if (m) return { kind: 'resume', id: m.id, title: m.title, dy: prog.last.dy || 0 };
    }
  }
  var unread = READY.filter(function (x) { return !prog.read[x.id]; });
  if (unread.length) return { kind: 'next', id: unread[0].id, title: unread[0].title, dy: 0 };
  return { kind: 'done', id: 'pk1', title: 'Practice Kit', dy: 0 };
}

function goTo(t) {
  if (!t) return;
  var el = document.getElementById(t.id);
  if (!el) return;
  if (t.dy) window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset + t.dy });
  else el.scrollIntoView({ block: 'start' });
}

function nextUnread() {
  var t = resumeTarget();
  return t ? SESSIONS.filter(function (x) { return x.id === t.id; })[0] || null : null;
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
      ? (ready.length < mine.length
          ? mine.length + ' sessions · ' + ready.length + ' ready'
          : read + ' of ' + mine.length + ' read')
      : mine.length + ' sessions · being written';
    a.querySelector('.bar i').style.width =
      (ready.length ? Math.round(read / ready.length * 100) : 0) + '%';
    li.appendChild(a);
    spActs.appendChild(li);
  });

  if (spCount) {
    spCount.innerHTML = '<b>' + SESSIONS.length + ' sessions</b> in five acts, plus a ' +
      '20-minute Fast Track and the Practice Kit · you have read <b>' + readCount() + '</b>';
  }
  if (spContinue) {
    var t = resumeTarget();
    spContinue.hidden = false;
    var lead = t.kind === 'resume' ? 'Resume' : (t.kind === 'done' ? 'Finished — go to' : (readCount() ? 'Continue' : 'Start reading'));
    spContinue.innerHTML = '';
    var l2 = document.createElement('span'); l2.className = 'lbl2'; l2.textContent = lead;
    spContinue.appendChild(l2);
    spContinue.appendChild(document.createTextNode(' ' + t.title));
    spContinue.onclick = function () { goTo(t); };

    /* The thumb-reachable button should say the same thing, so tapping it is
       not a leap of faith. */
    var bb = document.getElementById('bbContinue');
    if (bb) {
      var lab = bb.querySelector('span');
      if (lab) lab.textContent = t.kind === 'resume' ? 'Resume' : (t.kind === 'done' ? 'Kit' : 'Continue');
      bb.setAttribute('aria-label', lead + ' ' + t.title);
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

linkSessionRefs();
buildContents();
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
var fcSavedY = 0;
fcBtn.addEventListener('click', function () {
  /* Capture before the toggle: main is display:none in card mode, so by the
     time the class lands the browser has already clamped scrollY to zero. */
  var goingIn = !body.classList.contains('fcmode');
  if (goingIn) fcSavedY = window.pageYOffset;

  var on = body.classList.toggle('fcmode');
  fcBtn.setAttribute('aria-label', on ? 'Back to the book' : 'Flashcards');

  var cardsLabel = document.querySelector('#bbCards span');
  if (cardsLabel) cardsLabel.textContent = on ? 'Back' : 'Cards';

  if (on) {
    lastBarT = null;
    barTitle.innerHTML = 'Flashcards<small>Tap a card to flip</small>';
    window.scrollTo(0, 0);
  } else {
    window.scrollTo(0, fcSavedY);
    lastBarT = null;
    onScroll();
  }
});


/* ---------------- bottom bar ---------------- */
var bbToc = $('#bbToc'), bbSearch = $('#bbSearch'), bbCards = $('#bbCards'), bbFast = $('#bbContinue');
function goContents() {
  if (body.classList.contains('fcmode')) fcBtn.click();
  var c = document.getElementById('contents');
  /* Assigning a hash that is already set does nothing, so the button appeared
     broken on every press after the first. */
  if (location.hash === '#contents' && c) c.scrollIntoView({ behavior: 'smooth', block: 'start' });
  else location.hash = '#contents';
}
if (bbToc)    bbToc.addEventListener('click', goContents);
var bbKit = $('#bbKit');
if (bbKit)    bbKit.addEventListener('click', function () {
  if (body.classList.contains('fcmode')) fcBtn.click();
  location.hash = '#pk1';
});
if (bbSearch) bbSearch.addEventListener('click', openSearch);
if (bbFast)   bbFast.addEventListener('click', function () {
  if (body.classList.contains('fcmode')) fcBtn.click();
  goTo(resumeTarget());
});
if (bbCards)  bbCards.addEventListener('click', function () { fcBtn.click(); });

/* ---------------- session stepper ----------------
   Previous / Contents / Next at the foot of every session, so you can move
   through the book without going anywhere else, and get back to the contents
   from wherever you are. */
(function buildSteppers() {
  var chaps = $$('h3.chap').filter(function (h) { return h.id; });
  chaps.forEach(function (h, i) {
    var prev = chaps[i - 1], next = chaps[i + 1];
    if (!prev && !next) return;

    var stop = h.nextElementSibling, last = h;
    while (stop && !(stop.tagName === 'H3' && stop.classList.contains('chap'))) {
      last = stop; stop = stop.nextElementSibling;
    }

    var nav = document.createElement('nav');
    nav.className = 'stepper';
    nav.setAttribute('aria-label', 'Session navigation');

    function link(target, dir, cls) {
      var a = document.createElement('a');
      a.className = cls;
      a.href = '#' + target.id;
      var d = document.createElement('span'); d.className = 'dir'; d.textContent = dir;
      var t = document.createElement('span'); t.className = 'ttl'; t.textContent = target.textContent.trim();
      a.appendChild(d); a.appendChild(t);
      return a;
    }

    var here = h.closest('section.part');
    var mine = here ? $$('h3.chap', here) : [];
    var posInAct = mine.indexOf(h) + 1;

    function dirFor(target, word) {
      var there = target.closest('section.part');
      if (there && here && there !== here) {
        var b = there.querySelector('.part-banner');
        var lbl = b && b.querySelector('.k') ? b.querySelector('.k').textContent : '';
        var nm = b && b.querySelector('h2') ? b.querySelector('h2').textContent : '';
        return word + ' \u00b7 ' + (lbl && /^Act/i.test(lbl) ? lbl.toUpperCase() + ' BEGINS' : (nm || 'REFERENCE').toUpperCase());
      }
      return word + (mine.length > 1 ? ' \u00b7 ' + (posInAct + (word.indexOf('Next') >= 0 ? 1 : -1)) + ' of ' + mine.length + ' in this act' : '');
    }

    if (prev) nav.appendChild(link(prev, dirFor(prev, '\u2190 Previous'), 'prev'));

    var toc = document.createElement('a');
    toc.className = 'tocjump';
    if (here) {
      var b2 = here.querySelector('.part-banner h2');
      toc.href = '#toc-' + here.id;
      toc.textContent = b2 ? 'Back to ' + b2.textContent : 'Contents';
    } else {
      toc.href = '#contents';
      toc.textContent = 'Contents';
    }
    nav.appendChild(toc);

    if (next) nav.appendChild(link(next, dirFor(next, 'Next \u2192'), 'next'));

    if (last && last.parentNode) last.parentNode.insertBefore(nav, last.nextSibling);
  });
})();

/* ---------------- keyboard ---------------- */
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    if (lb.classList.contains('on')) { lb.classList.remove('on'); return; }
    if (body.classList.contains('search-open')) { closeSearch(); return; }
    if (body.classList.contains('fcmode')) { fcBtn.click(); return; }
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
