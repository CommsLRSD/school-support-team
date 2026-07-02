/*
 * Interactivity for the School & Classroom Support Team app.
 *
 * Responsibilities:
 *   - Landing screen & mode selection (Guided Tour / Explore & Search)
 *   - Dark mode toggle with localStorage persistence
 *   - Section/panel navigation (prev / next / sidebar links)
 *   - Guided mode: progress bar, step list, key takeaway cards
 *   - Browse mode: free navigation via sidebar
 *   - Global search overlay: indexes all content, highlights matches
 *   - Team search & filter (in panel-team)
 *   - Member bio modal
 *   - Mobile sidebar toggle
 *   - Focus carousels (accessibility)
 *   - Tier explorer tabs
 *
 * No build step or framework required — plain, dependency-free JavaScript.
 */
(function () {
  "use strict";

  const data = window.SCST;

  /* ─────────────────────────────────────────────────────────── Constants */

  const DARK_TIER_INDEX   = 1;
  const DIRECTOR_ROLE_PAT = /director/i;
  const MAX_ACTIONS       = 4;
  const PLACEHOLDER_PHOTO = "assets/placeholder-headshot.jpg";

  /* ─────────────────────────────────────────────────────────── Utilities */

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  function el(tag, opts = {}) {
    const node = document.createElement(tag);
    if (opts.class) node.className = opts.class;
    if (opts.text  != null) node.textContent = opts.text;
    if (opts.html  != null) node.innerHTML   = opts.html;
    if (opts.attrs) {
      Object.entries(opts.attrs).forEach(([k, v]) => node.setAttribute(k, v));
    }
    return node;
  }

  function listItems(parent, items) {
    if (!parent) return;
    parent.innerHTML = "";
    items.forEach((text) => parent.appendChild(el("li", { text })));
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  }

  function highlight(text, query) {
    const safe = escapeHtml(text);
    if (!query) return safe;
    const esc = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return safe.replace(new RegExp("(" + esc + ")", "gi"), "<mark>$1</mark>");
  }

  // Inline SVG icons keyed by id (used in area cards).
  const ICONS = {
    compass:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polygon points="16 8 14 14 8 16 10 10 16 8"/></svg>',
    book:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z"/><path d="M18 3v16"/></svg>',
    users:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 19v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 19v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13A4 4 0 0 1 16 11"/></svg>',
    feather:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 4a7 7 0 0 0-9.9 0L4 10v10h10l6-6a7 7 0 0 0 0-9.9z"/><path d="M16 8 4 20"/><path d="M16 8H9"/></svg>',
    heart:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 22l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>',
    star:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15 9 22 9.3 16.5 13.8 18.5 21 12 17 5.5 21 7.5 13.8 2 9.3 9 9 12 2"/></svg>',
  };

  /* ─────────────────────────────────────────────────────────── Dark mode */

  function initDarkMode() {
    const saved = localStorage.getItem("scst-dark-mode");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (saved === "1" || (saved === null && prefersDark)) {
      document.documentElement.classList.add("dark");
    }
    $$(".dark-toggle, #dark-toggle, #landing-dark-toggle").forEach((btn) => {
      btn.addEventListener("click", toggleDarkMode);
    });
  }

  function toggleDarkMode() {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("scst-dark-mode", isDark ? "1" : "0");
  }

  /* ─────────────────────────────────────────────────────────── Sections */

  const SECTIONS = [
    { id: "overview", panel: "panel-overview", label: "Who We Are",        takeawayKey: "overview" },
    { id: "why",      panel: "panel-why",      label: "Why It Matters",    takeawayKey: "why"      },
    { id: "support",  panel: "panel-support",  label: "How We Support",    takeawayKey: "support"  },
    { id: "data",     panel: "panel-data",     label: "Using Data",        takeawayKey: "data"     },
    { id: "team",     panel: "panel-team",     label: "Our Team",          takeawayKey: "team"     },
    { id: "schools",  panel: "panel-schools",  label: "For Schools",       takeawayKey: "schools"  },
    { id: "ahead",    panel: "panel-ahead",    label: "Looking Ahead",     takeawayKey: "ahead"    },
    { id: "contact",  panel: "panel-contact",  label: "Contact",           takeawayKey: "contact"  },
  ];

  let currentIndex = 0;

  function showSection(idx) {
    if (idx < 0 || idx >= SECTIONS.length) return;
    currentIndex = idx;
    const sec = SECTIONS[idx];

    SECTIONS.forEach(({ panel }) => {
      const p = $("#" + panel);
      if (p) p.hidden = true;
    });

    const active = $("#" + sec.panel);
    if (active) {
      active.hidden = false;
      // Re-trigger entrance animation
      active.style.animation = "none";
      active.offsetHeight; // reflow
      active.style.animation = "";
    }

    // Sync sidebar nav links
    $$(".nav-list-item").forEach((link) => {
      const isActive = link.dataset.section === sec.id;
      link.classList.toggle("active", isActive);
      link.setAttribute("aria-current", isActive ? "page" : "false");
    });

    // Sync guided step list
    $$(".guided-step-item").forEach((item, i) => {
      item.classList.toggle("is-current", i === idx);
      item.classList.toggle("is-done",    i < idx);
      item.setAttribute("aria-current", i === idx ? "step" : "false");
    });

    // Prev / Next buttons
    const prevBtn = $("#prev-btn");
    const nextBtn = $("#next-btn");
    const counter = $("#pag-counter");
    if (prevBtn) prevBtn.disabled = idx === 0;
    if (nextBtn) nextBtn.disabled = idx === SECTIONS.length - 1;
    if (counter) counter.textContent = (idx + 1) + " / " + SECTIONS.length;

    // Guided mode progress bar
    updateGuidedProgress(idx);

    // Scroll top
    const body = $(".content-body");
    if (body) body.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (sec.id === "team") setTimeout(observeReveals, 50);
  }

  function updateGuidedProgress(idx) {
    const wrap  = $("#guided-progress-wrap");
    const fill  = $("#guided-progress-fill");
    const label = $("#guided-progress-label");
    if (!wrap || !fill || !label) return;
    const pct = ((idx + 1) / SECTIONS.length) * 100;
    fill.style.width = pct + "%";
    label.textContent = "Step " + (idx + 1) + " of " + SECTIONS.length + " · " + SECTIONS[idx].label;
  }

  /* ─────────────────────────────────────────────────── Key takeaway cards */

  function injectTakeaways() {
    SECTIONS.forEach((sec) => {
      const panel = $("#" + sec.panel);
      if (!panel) return;
      const text = data.takeaways && data.takeaways[sec.takeawayKey];
      if (!text) return;

      const card = el("div", { class: "takeaway-card" });
      const iconWrap = el("span", { class: "takeaway-icon", attrs: { "aria-hidden": "true" } });
      iconWrap.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
      const label = el("span", { class: "takeaway-label", text: "Key Takeaway" });
      const head  = el("div", { class: "takeaway-head" });
      head.appendChild(iconWrap);
      head.appendChild(label);
      card.appendChild(head);
      card.appendChild(el("p", { class: "takeaway-text", text }));
      panel.appendChild(card);
    });
  }

  /* ─────────────────────────────────────────────────────────── Navigation */

  function wireNavigation() {
    // Sidebar nav links (browse mode)
    $$(".nav-list-item").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const id  = link.dataset.section;
        const idx = SECTIONS.findIndex((s) => s.id === id);
        if (idx !== -1) {
          showSection(idx);
          closeSidebar();
        }
      });
    });

    // Guided step list items
    document.addEventListener("click", (e) => {
      const item = e.target.closest(".guided-step-item");
      if (item) {
        const idx = parseInt(item.dataset.index, 10);
        if (!isNaN(idx)) {
          showSection(idx);
          closeSidebar();
        }
      }
    });

    // Prev / Next
    const prevBtn = $("#prev-btn");
    const nextBtn = $("#next-btn");
    if (prevBtn) prevBtn.addEventListener("click", () => showSection(currentIndex - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => showSection(currentIndex + 1));

    // Arrow key shortcuts (not active inside inputs or on landing screen)
    document.addEventListener("keydown", (e) => {
      const tag = document.activeElement.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const landingEl = $("#landing");
      const appVisible = !landingEl || landingEl.hidden;
      if (e.key === "ArrowRight" && appVisible) showSection(currentIndex + 1);
      if (e.key === "ArrowLeft"  && appVisible) showSection(currentIndex - 1);
    });
  }

  /* ─────────────────────────────────────────────────────────── App modes */

  // appMode: 'guided' | 'browse'
  let appMode = "guided";

  function applyMode(mode) {
    appMode = mode;
    const shell    = $("#app-shell");
    const sideNav  = $("#sidebar-nav");
    const stepList = $("#guided-step-list");
    const progWrap = $("#guided-progress-wrap");
    const modeLabel = $("#mode-switch-label");
    const modeBtn   = $("#mode-switch-btn");

    if (mode === "guided") {
      if (sideNav)  sideNav.hidden  = true;
      if (stepList) stepList.hidden = false;
      if (progWrap) { progWrap.hidden = false; progWrap.removeAttribute("aria-hidden"); }
      if (shell)    shell.setAttribute("data-mode", "guided");
      if (modeLabel) modeLabel.textContent = "Browse";
      if (modeBtn)   modeBtn.setAttribute("title", "Switch to Browse mode");
    } else {
      if (sideNav)  sideNav.hidden  = false;
      if (stepList) stepList.hidden = true;
      if (progWrap) { progWrap.hidden = true; progWrap.setAttribute("aria-hidden", "true"); }
      if (shell)    shell.setAttribute("data-mode", "browse");
      if (modeLabel) modeLabel.textContent = "Guided";
      if (modeBtn)   modeBtn.setAttribute("title", "Switch to Guided mode");
    }

    updateGuidedProgress(currentIndex);
  }

  function buildGuidedStepList() {
    const list = $("#guided-step-list");
    if (!list) return;
    list.innerHTML = "";
    SECTIONS.forEach((sec, i) => {
      const item = el("li", {
        class: "guided-step-item" + (i === 0 ? " is-current" : ""),
        attrs: { "data-index": String(i), role: "button", tabindex: "0", "aria-current": i === 0 ? "step" : "false" },
      });
      const num  = el("span", { class: "step-num",  text: String(i + 1) });
      const name = el("span", { class: "step-label", text: sec.label });
      item.appendChild(num);
      item.appendChild(name);
      list.appendChild(item);

      item.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          showSection(i);
          closeSidebar();
        }
      });
    });
  }

  /* ─────────────────────────────────────────────────── Landing screen */

  function showLanding() {
    const landing = $("#landing");
    const shell   = $("#app-shell");
    if (landing) landing.hidden = false;
    if (shell)   shell.hidden   = true;
    document.body.classList.add("on-landing");
  }

  function hideLanding(mode) {
    const landing = $("#landing");
    const shell   = $("#app-shell");
    if (landing) landing.hidden = true;
    if (shell)   shell.hidden   = false;
    document.body.classList.remove("on-landing");
    applyMode(mode || "guided");
    showSection(0);
    setTimeout(initFocusCarousels, 100);
    setTimeout(observeReveals, 150);
  }

  function wireLanding() {
    $$("[data-mode]").forEach((btn) => {
      btn.addEventListener("click", () => hideLanding(btn.dataset.mode));
    });
  }

  function wireModeSwitch() {
    const btn = $("#mode-switch-btn");
    if (!btn) return;
    btn.addEventListener("click", () => {
      applyMode(appMode === "guided" ? "browse" : "guided");
    });

    const homeBtn = $("#home-btn");
    if (homeBtn) {
      homeBtn.addEventListener("click", () => showLanding());
    }
  }

  /* ─────────────────────────────────────────────────── Mobile sidebar */

  function openSidebar() {
    const sidebar   = $("#sidebar");
    const overlay   = $("#sidebar-overlay");
    const toggleBtn = $("#sidebar-toggle-btn");
    if (sidebar)   sidebar.classList.add("open");
    if (overlay)   overlay.classList.add("open");
    if (toggleBtn) toggleBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  function closeSidebar() {
    const sidebar   = $("#sidebar");
    const overlay   = $("#sidebar-overlay");
    const toggleBtn = $("#sidebar-toggle-btn");
    if (sidebar)   sidebar.classList.remove("open");
    if (overlay)   overlay.classList.remove("open");
    if (toggleBtn) toggleBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  function wireSidebarToggle() {
    const toggleBtn = $("#sidebar-toggle-btn");
    const overlay   = $("#sidebar-overlay");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        const s = $("#sidebar");
        if (s && s.classList.contains("open")) closeSidebar();
        else openSidebar();
      });
    }
    if (overlay) overlay.addEventListener("click", closeSidebar);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const s = $("#sidebar");
        if (s && s.classList.contains("open")) closeSidebar();
      }
    });
  }

  /* ──────────────────────────────────────────────────────── Static content */

  function buildMemberIndex() {
    const list = [];
    (data.areas || []).forEach((area) => {
      const push = (m, subteam) => list.push({ ...m, areaId: area.id, areaName: area.name, subteam });
      (area.members || []).forEach((m) => push(m, null));
      (area.subteams || []).forEach((st) => (st.members || []).forEach((m) => push(m, st.name)));
    });
    return list;
  }
  const memberIndex = buildMemberIndex();

  function renderStaticContent() {
    // Who We Are
    const whoIntro = $("#who-intro");
    if (whoIntro) whoIntro.textContent = data.whoWeAre.intro;
    listItems($("#grounded-in"),    data.whoWeAre.groundedIn);
    listItems($("#work-alongside"), data.whoWeAre.workAlongside);
    const whoSum = $("#who-summary");
    if (whoSum) whoSum.textContent = data.whoWeAre.summary;

    // Stats
    const statsWrap = $("#hero-stats");
    if (statsWrap) {
      [
        { n: data.areas.length,   label: "Areas of support" },
        { n: memberIndex.length,  label: "Team members"     },
        { n: data.tiers.length,   label: "Tiers of support" },
      ].forEach((s) => {
        const d = el("div");
        d.appendChild(el("dt", { text: String(s.n) }));
        d.appendChild(el("dd", { text: s.label }));
        statsWrap.appendChild(d);
      });
    }

    // Why It Matters
    const whyIntro = $("#why-intro");
    if (whyIntro) whyIntro.textContent = data.whyItMatters.intro;

    const whyWrap = $("#why-walkthrough");
    if (whyWrap) {
      data.whyItMatters.highlights.forEach((text, i) => {
        const cls = i % 2 === 1 ? "highlight-card highlight-card-dark" : "highlight-card";
        const card = el("div", { class: cls });
        card.appendChild(el("span", { class: "hc-num", text: "0" + (i + 1) }));
        card.appendChild(el("p", { text }));
        whyWrap.appendChild(card);
      });

      const pCard = el("div", { class: "info-card" });
      pCard.appendChild(el("h3", { text: "How we prioritize support" }));
      const pList = el("ul", { class: "check-list" });
      data.whyItMatters.prioritizes.forEach((t) => pList.appendChild(el("li", { text: t })));
      pCard.appendChild(pList);
      whyWrap.appendChild(pCard);

      const sCard = el("div", { class: "info-card info-card-accent" });
      sCard.appendChild(el("h3", { text: "Advancing the Multi-Year Strategic Plan" }));
      const sList = el("ul", { class: "tag-list" });
      data.whyItMatters.strategicPlan.forEach((t) => sList.appendChild(el("li", { text: t })));
      sCard.appendChild(sList);
      whyWrap.appendChild(sCard);
    }

    // How We Support
    const supIntro = $("#support-intro");
    if (supIntro) supIntro.textContent = data.howWeSupport.intro;
    const actions = data.howWeSupport.actions || [];
    const actionList = $("#support-actions");
    if (actionList) {
      listItems(actionList, actions.slice(0, MAX_ACTIONS));
      if (actions.length > MAX_ACTIONS) {
        actionList.appendChild(
          el("li", { class: "pill-list-more", text: `+${actions.length - MAX_ACTIONS} more ways we support schools` })
        );
      }
    }

    // Data sources
    listItems($("#data-sources"), data.dataSources);
    listItems($("#data-ensures"), data.dataEnsures);

    // School-based support
    const sbIntro = $("#school-based-intro");
    if (sbIntro) {
      data.schoolBased.intro.forEach((p) => sbIntro.appendChild(el("p", { text: p })));
    }
    const eqIntro = $("#equity-intro");
    if (eqIntro) eqIntro.textContent = data.schoolBased.equityModelIntro;

    const swWrap = $("#schools-walkthrough");
    if (swWrap) {
      data.tiers.forEach((tier, i) => {
        const classes = ["equity-card", "t" + (i + 1), i === DARK_TIER_INDEX ? "equity-card-dark" : null]
          .filter(Boolean).join(" ");
        const card = el("div", { class: classes });
        card.appendChild(el("span", { class: "ec-level", text: tier.level }));
        card.appendChild(el("h4",   { text: tier.name }));
        card.appendChild(el("p",    { text: tier.summary }));
        swWrap.appendChild(card);
      });

      const embCard = el("div", { class: "info-card" });
      embCard.appendChild(el("h3", { text: "Embedded Support Rationale" }));
      embCard.appendChild(el("p", { class: "muted-text", text: data.schoolBased.embeddedRationale.intro }));
      const embList = el("ul", { class: "check-list" });
      data.schoolBased.embeddedRationale.factors.forEach((t) => embList.appendChild(el("li", { text: t })));
      embCard.appendChild(embList);
      swWrap.appendChild(embCard);

      const dirCard = el("div", { class: "info-card info-card-accent" });
      dirCard.appendChild(el("h3", { text: "Instructional Support — Current Direction" }));
      data.schoolBased.currentDirection.forEach((block) => {
        const b = el("div", { class: "direction-block" });
        b.appendChild(el("h4", { text: block.title }));
        const ul = el("ul");
        block.points.forEach((p) => ul.appendChild(el("li", { text: p })));
        b.appendChild(ul);
        dirCard.appendChild(b);
      });
      swWrap.appendChild(dirCard);
    }

    // Looking Ahead
    const ahIntro = $("#ahead-intro");
    if (ahIntro) ahIntro.textContent = data.lookingAhead.intro;
    listItems($("#ahead-points"), data.lookingAhead.points);
    const ahMentor = $("#ahead-mentorship");
    if (ahMentor) ahMentor.textContent = data.lookingAhead.mentorship;

    // Contact leaders
    const contactWrap = $("#contact-leaders");
    if (contactWrap) {
      data.areas[0].members.slice(0, 3).forEach((m) => {
        const cls = DIRECTOR_ROLE_PAT.test(m.role) ? "contact-card contact-card-dark" : "contact-card";
        const card  = el("div", { class: cls });
        const photo = el("img", { class: "contact-photo", attrs: { src: PLACEHOLDER_PHOTO, alt: m.name } });
        card.appendChild(photo);
        card.appendChild(el("p", { class: "cc-name", text: m.name }));
        card.appendChild(el("p", { class: "cc-role", text: m.role }));
        contactWrap.appendChild(card);
      });
    }
  }

  /* ────────────────────────────────────────────────────── Focus carousels */

  function initFocusCarousels() {
    $$(".focus-carousel").forEach((wrap, ci) => {
      const items = Array.from(wrap.children);
      if (items.length <= 1) return;
      if (wrap.classList.contains("carousel-ready")) return;
      wrap.classList.add("carousel-ready", "is-carousel");

      let cur = 0;
      items.forEach((item, i) => {
        item.classList.add("carousel-item");
        const summary = (item.querySelector("h3, h4, .cc-name, p") || {}).textContent || "item";
        item.setAttribute("aria-label", `Card ${i + 1} of ${items.length}: ${summary.trim().slice(0, 80)}`);
        item.hidden = i !== cur;
      });
      wrap.setAttribute("role", "region");
      const panelLabel = (wrap.closest(".content-panel")?.querySelector(".panel-eyebrow, h2") || {}).textContent || "highlights";
      wrap.setAttribute("aria-label", panelLabel.trim());

      const controls = el("div", { class: "focus-carousel-controls" });
      const pBtn = el("button", { class: "carousel-btn", text: "Previous", attrs: { type: "button", "aria-label": "Show previous item" } });
      const status = el("span", { class: "carousel-status", attrs: { "aria-live": "polite" } });
      const nBtn = el("button", { class: "carousel-btn", text: "Next", attrs: { type: "button", "aria-label": "Show next item" } });

      function render() {
        items.forEach((item, i) => {
          item.hidden = i !== cur;
          item.classList.toggle("is-active", i === cur);
          item.setAttribute("tabindex", i === cur ? "0" : "-1");
        });
        pBtn.disabled = cur === 0;
        nBtn.disabled = cur === items.length - 1;
        status.textContent = `${cur + 1} / ${items.length}`;
      }

      pBtn.addEventListener("click", () => { if (cur > 0) { cur--; render(); items[cur].focus({ preventScroll: true }); } });
      nBtn.addEventListener("click", () => { if (cur < items.length - 1) { cur++; render(); items[cur].focus({ preventScroll: true }); } });

      controls.appendChild(pBtn);
      controls.appendChild(status);
      controls.appendChild(nBtn);
      controls.id = `focus-carousel-ctrl-${ci}`;
      wrap.insertAdjacentElement("afterend", controls);
      render();
    });
  }

  /* ──────────────────────────────────────────────────────── Tier explorer */

  function renderTiers() {
    const tabs  = $("#tier-tabs");
    const panel = $("#tier-panel");
    if (!tabs || !panel) return;

    function showTier(tier) {
      panel.innerHTML = "";
      panel.appendChild(el("span", { class: "tp-badge", text: tier.level }));
      panel.appendChild(el("h3",   { text: tier.name }));
      panel.appendChild(el("p",    { class: "tp-summary", text: tier.summary }));
      const ul = el("ul", { class: "check-list" });
      tier.includes.forEach((t) => ul.appendChild(el("li", { text: t })));
      panel.appendChild(ul);
      panel.appendChild(el("p", { class: "tp-goal", text: tier.goal }));
    }

    data.tiers.forEach((tier, i) => {
      const tab = el("button", {
        class: "tier-tab",
        attrs: { role: "tab", "aria-selected": i === 0 ? "true" : "false", type: "button" },
      });
      tab.appendChild(el("span", { class: "tt-level", text: tier.level }));
      tab.appendChild(el("span", { class: "tt-name",  text: tier.name  }));
      tab.addEventListener("click", () => {
        $$(".tier-tab", tabs).forEach((t) => t.setAttribute("aria-selected", "false"));
        tab.setAttribute("aria-selected", "true");
        showTier(tier);
      });
      tabs.appendChild(tab);
    });

    showTier(data.tiers[0]);
  }

  /* ──────────────────────────────────────────────────────── Team section */

  let activeFilter = "all";
  let activeQuery  = "";
  let activeMemberIdx = 0;

  function memberMatches(m) {
    if (!activeQuery) return true;
    const q = activeQuery.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q);
  }

  function getFilteredMembers() {
    return memberIndex.filter(
      (m) => (activeFilter === "all" || m.areaId === activeFilter) && memberMatches(m)
    );
  }

  function renderTeamContext(member) {
    const ctx = $("#team-context");
    if (!ctx) return;
    ctx.innerHTML = "";
    if (!member) return;
    const area = data.areas.find((a) => a.id === member.areaId);
    if (!area) return;
    const row = el("div", { class: "team-context-row" });
    row.appendChild(el("p", { class: "team-context-title",   text: area.name }));
    row.appendChild(el("p", { class: "team-context-purpose", text: area.purpose }));
    ctx.appendChild(row);
  }

  function renderTeam() {
    const stage = $("#team-member-stage");
    if (!stage) return;
    stage.innerHTML = "";
    const visible = getFilteredMembers();

    const noRes  = $("#no-results");
    const cntEl  = $("#results-count");
    if (visible.length === 0) {
      if (noRes) noRes.hidden = false;
      if (cntEl) cntEl.textContent = "";
      renderTeamContext(null);
      return;
    }
    if (noRes) noRes.hidden = true;

    activeMemberIdx = Math.max(0, Math.min(activeMemberIdx, visible.length - 1));
    const selected  = visible[activeMemberIdx];
    renderTeamContext(selected);

    if (cntEl) {
      cntEl.textContent = (activeQuery || activeFilter !== "all")
        ? `Showing ${visible.length} team member${visible.length === 1 ? "" : "s"}`
        : `${visible.length} team members across ${data.areas.length} areas of support`;
    }

    // Member selector strip
    const strip = el("div", {
      class: "member-selector-strip",
      attrs: { role: "tablist", "aria-label": "Choose a team member" },
    });
    visible.forEach((m, i) => {
      const chip = el("button", {
        class: "member-chip" + (i === activeMemberIdx ? " is-active" : ""),
        html:  highlight(m.name, activeQuery),
        attrs: { type: "button", role: "tab", "aria-selected": i === activeMemberIdx ? "true" : "false" },
      });
      chip.addEventListener("click", () => { activeMemberIdx = i; renderTeam(); });
      strip.appendChild(chip);
    });
    stage.appendChild(strip);

    // Focus card
    const focusCard = el("article", { class: "team-focus-card" });
    const head = el("div", { class: "team-focus-head" });
    const photo = el("img", { class: "team-focus-photo", attrs: { src: PLACEHOLDER_PHOTO, alt: selected.name } });
    head.appendChild(photo);
    const info = el("div", { class: "team-focus-info" });
    info.appendChild(el("h3", { html: highlight(selected.name, activeQuery) }));
    info.appendChild(el("p",  { class: "team-focus-role", html: highlight(selected.role, activeQuery) }));
    const areaLabel = selected.areaName + (selected.subteam ? " · " + selected.subteam : "");
    info.appendChild(el("p", { class: "team-focus-area", text: areaLabel }));
    head.appendChild(info);
    focusCard.appendChild(head);
    focusCard.appendChild(el("p", { class: "team-focus-bio", text: selected.bio }));

    const actionsRow = el("div", { class: "team-focus-actions" });
    const pBtn = el("button", { class: "team-pager-btn", text: "Previous", attrs: { type: "button", "aria-label": "Show previous team member" } });
    pBtn.disabled = activeMemberIdx === 0;
    pBtn.addEventListener("click", () => { if (activeMemberIdx > 0) { activeMemberIdx--; renderTeam(); } });
    const statusEl = el("span", { class: "team-pager-status", text: `${activeMemberIdx + 1} / ${visible.length}`, attrs: { "aria-live": "polite" } });
    const nBtn = el("button", { class: "team-pager-btn", text: "Next", attrs: { type: "button", "aria-label": "Show next team member" } });
    nBtn.disabled = activeMemberIdx === visible.length - 1;
    nBtn.addEventListener("click", () => { if (activeMemberIdx < visible.length - 1) { activeMemberIdx++; renderTeam(); } });
    const bioBtn = el("button", { class: "team-bio-btn", text: "Open full bio", attrs: { type: "button" } });
    bioBtn.addEventListener("click", () => openModal(selected));
    actionsRow.appendChild(pBtn);
    actionsRow.appendChild(statusEl);
    actionsRow.appendChild(nBtn);
    actionsRow.appendChild(bioBtn);
    focusCard.appendChild(actionsRow);
    stage.appendChild(focusCard);
  }

  function renderFilters() {
    const wrap = $("#area-filters");
    if (!wrap) return;
    [{ id: "all", name: "All areas" }].concat(data.areas.map((a) => ({ id: a.id, name: a.name }))).forEach((f) => {
      const chip = el("button", {
        class: "chip",
        text: f.name,
        attrs: { type: "button", "aria-pressed": f.id === "all" ? "true" : "false", "data-filter": f.id },
      });
      chip.addEventListener("click", () => {
        activeFilter = f.id;
        activeMemberIdx = 0;
        $$(".chip", wrap).forEach((c) => c.setAttribute("aria-pressed", c === chip ? "true" : "false"));
        renderTeam();
      });
      wrap.appendChild(chip);
    });
  }

  function wireTeamSearch() {
    const input = $("#team-search");
    if (!input) return;
    let timer;
    input.addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        activeQuery = input.value.trim();
        activeMemberIdx = 0;
        renderTeam();
      }, 120);
    });
  }

  /* ──────────────────────────────────────────────────── Member bio modal */

  let lastFocused = null;

  function openModal(member) {
    lastFocused = document.activeElement;
    const modal = $("#member-modal");
    if (!modal) return;
    const photo = $("#modal-photo");
    if (photo) { photo.src = PLACEHOLDER_PHOTO; photo.alt = member.name; }
    $("#modal-name").textContent = member.name;
    $("#modal-role").textContent = member.role;
    const areaLabel = member.areaName + (member.subteam ? " · " + member.subteam : "");
    $("#modal-area").textContent = areaLabel;
    $("#modal-bio").textContent  = member.bio;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    $(".modal-close", modal).focus();
  }

  function closeModal() {
    const modal = $("#member-modal");
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  function wireModal() {
    const modal = $("#member-modal");
    if (!modal) return;
    modal.addEventListener("click", (e) => { if (e.target.hasAttribute("data-close")) closeModal(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) closeModal(); });
  }

  /* ──────────────────────────────────────────────────── Global search */

  // Build a flat search index from all SCST content.
  function buildSearchIndex() {
    const index = [];

    // Sections
    const sectionContent = [
      { id: "overview", label: "Who We Are",      texts: [data.whoWeAre.intro, data.whoWeAre.summary, ...data.whoWeAre.groundedIn, ...data.whoWeAre.workAlongside] },
      { id: "why",      label: "Why It Matters",  texts: [data.whyItMatters.intro, ...data.whyItMatters.highlights, ...data.whyItMatters.prioritizes, ...data.whyItMatters.strategicPlan] },
      { id: "support",  label: "How We Support",  texts: [data.howWeSupport.intro, ...data.howWeSupport.actions] },
      { id: "data",     label: "Using Data",      texts: [...data.dataSources, ...data.dataEnsures] },
      { id: "schools",  label: "School-Based Support", texts: [...data.schoolBased.intro, data.schoolBased.equityModelIntro, ...data.schoolBased.embeddedRationale.factors] },
      { id: "ahead",    label: "Looking Ahead",   texts: [data.lookingAhead.intro, ...data.lookingAhead.points, data.lookingAhead.mentorship] },
    ];
    sectionContent.forEach((sec) => {
      index.push({ type: "section", sectionId: sec.id, label: sec.label, snippet: sec.texts.slice(0, 2).join(" — "), searchText: sec.texts.join(" ").toLowerCase() });
    });

    // Tiers
    data.tiers.forEach((tier) => {
      index.push({
        type: "tier",
        sectionId: "support",
        label: tier.level + ": " + tier.name,
        snippet: tier.summary,
        searchText: [tier.level, tier.name, tier.summary, tier.goal, ...tier.includes].join(" ").toLowerCase(),
      });
    });

    // Team members
    memberIndex.forEach((m) => {
      index.push({
        type: "person",
        sectionId: "team",
        member: m,
        label: m.name,
        snippet: m.role + (m.areaName ? " · " + m.areaName : ""),
        searchText: [m.name, m.role, m.areaName || "", m.subteam || "", m.bio || ""].join(" ").toLowerCase(),
      });
    });

    // Areas
    data.areas.forEach((area) => {
      index.push({
        type: "area",
        sectionId: "team",
        label: "Area: " + area.name,
        snippet: area.purpose,
        searchText: [area.name, area.purpose, ...(area.keyWork || [])].join(" ").toLowerCase(),
      });
    });

    return index;
  }
  const searchIndex = buildSearchIndex();

  function openSearchOverlay() {
    const overlay = $("#search-overlay");
    const input   = $("#global-search-input");
    if (!overlay) return;
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    if (input) { input.value = ""; input.focus(); }
    renderSearchResults("");
  }

  function closeSearchOverlay() {
    const overlay = $("#search-overlay");
    if (!overlay) return;
    overlay.hidden = true;
    document.body.style.overflow = "";
    const searchBtn = $("#search-btn");
    if (searchBtn) searchBtn.focus();
  }

  function renderSearchResults(query) {
    const emptyState = $("#search-empty-state");
    const resultsWrap = $("#search-results-wrap");
    if (!resultsWrap) return;

    if (!query.trim()) {
      if (emptyState)  emptyState.hidden = false;
      if (resultsWrap) resultsWrap.hidden = true;
      return;
    }

    if (emptyState)  emptyState.hidden = true;
    if (resultsWrap) resultsWrap.hidden = false;

    const q = query.trim().toLowerCase();
    const hits = searchIndex.filter((item) => item.searchText.includes(q));

    resultsWrap.innerHTML = "";

    if (hits.length === 0) {
      resultsWrap.appendChild(el("p", { class: "search-no-results", text: "No results found. Try a different search term." }));
      return;
    }

    // Group hits by type
    const groups = [
      { key: "person",  heading: "Team Members" },
      { key: "tier",    heading: "Levels of Support" },
      { key: "area",    heading: "Support Areas" },
      { key: "section", heading: "Sections" },
    ];

    groups.forEach(({ key, heading }) => {
      const group = hits.filter((h) => h.type === key);
      if (group.length === 0) return;

      const groupEl = el("div", { class: "search-result-group" });
      groupEl.appendChild(el("h3", { class: "search-group-heading", text: heading }));

      group.slice(0, key === "person" ? 20 : 10).forEach((hit) => {
        const item = el("button", { class: "search-result-item", attrs: { type: "button" } });
        const labelEl  = el("span", { class: "sri-label",  html: highlight(hit.label,  query) });
        const snippetEl = el("span", { class: "sri-snippet", html: highlight(hit.snippet, query) });
        item.appendChild(labelEl);
        item.appendChild(snippetEl);

        item.addEventListener("click", () => {
          closeSearchOverlay();
          const sIdx = SECTIONS.findIndex((s) => s.id === hit.sectionId);
          if (sIdx !== -1) showSection(sIdx);
          // For team members, set filter & member
          if (hit.type === "person" && hit.member) {
            activeFilter = hit.member.areaId;
            const mIdx = getFilteredMembers().findIndex((m) => m.name === hit.member.name);
            if (mIdx !== -1) activeMemberIdx = mIdx;
            renderTeam();
          }
          if (hit.type === "tier") {
            // Activate the matching tier tab
            setTimeout(() => {
              const tabs = $$(".tier-tab");
              tabs.forEach((tab) => {
                if (tab.querySelector(".tt-level") && tab.querySelector(".tt-level").textContent.toLowerCase() === hit.label.split(":")[0].trim().toLowerCase()) {
                  tab.click();
                }
              });
            }, 100);
          }
        });

        groupEl.appendChild(item);
      });

      resultsWrap.appendChild(groupEl);
    });

    const total = el("p", { class: "search-result-count", text: `${hits.length} result${hits.length === 1 ? "" : "s"} for "${query}"` });
    resultsWrap.insertBefore(total, resultsWrap.firstChild);
  }

  function wireSearch() {
    const searchBtn  = $("#search-btn");
    const closeBtn   = $("#search-close-btn");
    const backdrop   = $("#search-backdrop");
    const input      = $("#global-search-input");

    if (searchBtn)  searchBtn.addEventListener("click",  openSearchOverlay);
    if (closeBtn)   closeBtn.addEventListener("click",   closeSearchOverlay);
    if (backdrop)   backdrop.addEventListener("click",   closeSearchOverlay);

    if (input) {
      let timer;
      input.addEventListener("input", () => {
        clearTimeout(timer);
        timer = setTimeout(() => renderSearchResults(input.value), 150);
      });
    }

    document.addEventListener("keydown", (e) => {
      const overlay = $("#search-overlay");
      if (e.key === "Escape" && overlay && !overlay.hidden) closeSearchOverlay();
      // Keyboard shortcut: "/" opens search when not in an input
      if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        const landing = $("#landing");
        if (!landing || landing.hidden) {
          e.preventDefault();
          openSearchOverlay();
        }
      }
    });
  }

  /* ────────────────────────────────────────────────── Reveal animations */

  let revealObserver;

  function observeReveals() {
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("in");
              revealObserver.unobserve(e.target);
            }
          });
        },
        { threshold: 0.08 }
      );
    }
    $$(".reveal:not(.in)").forEach((node) => revealObserver.observe(node));
  }

  /* ──────────────────────────────────────────────────────────── Init */

  function init() {
    if (!data) return;

    initDarkMode();
    renderStaticContent();
    injectTakeaways();
    renderTiers();
    renderFilters();
    renderTeam();
    buildGuidedStepList();
    wireTeamSearch();
    wireModal();
    wireSidebarToggle();
    wireNavigation();
    wireLanding();
    wireModeSwitch();
    wireSearch();

    // Start on landing screen
    showLanding();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
