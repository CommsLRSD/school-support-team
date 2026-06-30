/*
 * Interactivity for the School & Classroom Support Team dashboard.
 * Renders content from data.js, powers the side-nav panel system,
 * tier explorer, team search/filter, member bio modals, and prev/next
 * section navigation.
 *
 * No build step or framework required — plain, dependency-free JavaScript.
 */
(function () {
  "use strict";

  const data = window.SCST;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ─────────────────────────────────────────────── Panel definitions */

  const PANELS = [
    { id: "overview",  label: "Overview",         icon: "home" },
    { id: "who-we-are",label: "Who We Are",       icon: "info" },
    { id: "why",       label: "Why It Matters",   icon: "alert" },
    { id: "support",   label: "How We Support",   icon: "layers" },
    { id: "data",      label: "Using Data",       icon: "chart" },
    { id: "team",      label: "Our Team",         icon: "users" },
    { id: "schools",   label: "For Schools",      icon: "building" },
    { id: "ahead",     label: "Looking Ahead",    icon: "arrow" },
    { id: "contact",   label: "Contact",          icon: "mail" },
  ];

  /* Inline SVG icons keyed by name */
  const ICONS = {
    home:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    info:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    alert:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    layers:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
    chart:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    users:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
    arrow:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
    mail:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    compass:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polygon points="16 8 14 14 8 16 10 10 16 8"/></svg>',
    book:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z"/><path d="M18 3v16"/></svg>',
    feather:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 4a7 7 0 0 0-9.9 0L4 10v10h10l6-6a7 7 0 0 0 0-9.9z"/><path d="M16 8 4 20"/><path d="M16 8H9"/></svg>',
    heart:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 22l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>',
    star:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15 9 22 9.3 16.5 13.8 18.5 21 12 17 5.5 21 7.5 13.8 2 9.3 9 9 12 2"/></svg>',
  };

  /* Map area icon names → panel icons for the overview cards */
  const AREA_ICON_MAP = {
    leadership:         "compass",
    instructional:      "book",
    "student-services": "users",
    "indigenous-education": "feather",
    clinical:           "heart",
    specialized:        "star",
  };

  /* Placeholder headshot path */
  const PLACEHOLDER_PHOTO = "assets/img/headshots/placeholder-headshot.jpg";

  /* ─────────────────────────────────────────────── Utilities */

  function el(tag, opts = {}) {
    const node = document.createElement(tag);
    if (opts.class)            node.className = opts.class;
    if (opts.text  != null)    node.textContent = opts.text;
    if (opts.html  != null)    node.innerHTML = opts.html;
    if (opts.attrs) Object.entries(opts.attrs).forEach(([k, v]) => node.setAttribute(k, v));
    return node;
  }

  function listItems(parent, items, className) {
    if (!parent) return;
    parent.innerHTML = "";
    items.forEach((text) => parent.appendChild(el("li", { text, class: className })));
  }

  function initials(name) {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] || "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
  }

  const AVATAR_COLORS = ["#b23428","#7a2018","#c07a2a","#2f6f4e","#6a4a86","#356b9a","#5a7a2a","#884420"];
  function avatarColor(name) {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 100000;
    return AVATAR_COLORS[h % AVATAR_COLORS.length];
  }

  /* Returns an <img> headshot (or initials avatar as fallback) */
  function makeHeadshot(member, size = 48) {
    const src = member.photo || PLACEHOLDER_PHOTO;
    const img = el("img", {
      class: "headshot",
      attrs: { src, alt: member.name, loading: "lazy" },
    });
    img.style.width  = size + "px";
    img.style.height = size + "px";
    /* If the image fails to load, replace with initials avatar */
    img.addEventListener("error", function () {
      const av = el("span", { class: "avatar", text: initials(member.name) });
      av.style.background = avatarColor(member.name);
      av.style.width  = size + "px";
      av.style.height = size + "px";
      av.style.fontSize = (size * 0.33) + "px";
      img.replaceWith(av);
    });
    return img;
  }

  /* Initials avatar (used for contact cards) */
  function makeAvatar(name, size = 48) {
    const av = el("span", { class: "avatar", text: initials(name) });
    av.style.background = avatarColor(name);
    av.style.width  = size + "px";
    av.style.height = size + "px";
    av.style.fontSize = (size * 0.33) + "px";
    return av;
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  }

  function highlight(text, query) {
    const safe = escapeHtml(text);
    if (!query) return safe;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return safe.replace(new RegExp("(" + escaped + ")", "gi"), "<mark>$1</mark>");
  }

  /* ─────────────────────────────────────────────── Member index */

  function buildMemberIndex() {
    const list = [];
    data.areas.forEach((area) => {
      const push = (member, subteam) =>
        list.push({ ...member, areaId: area.id, areaName: area.name, subteam });
      (area.members  || []).forEach((m) => push(m, null));
      (area.subteams || []).forEach((st) => (st.members || []).forEach((m) => push(m, st.name)));
    });
    return list;
  }
  const memberIndex = buildMemberIndex();

  /* ═══════════════════════════════════════════════════════════════════════
     PANEL NAVIGATION
     ═══════════════════════════════════════════════════════════════════════ */

  let currentPanelIndex = 0;

  function buildSidebarMenu() {
    const menu = $("#sidebar-menu");
    PANELS.forEach((p, i) => {
      const li  = el("li");
      const a   = el("a", {
        text: p.label,
        attrs: { href: "#", "data-panel": p.id },
      });
      const icon = el("span", { class: "nav-icon", html: ICONS[p.icon] || "" });
      a.prepend(icon);
      if (i === 0) a.classList.add("active");
      a.addEventListener("click", (e) => {
        e.preventDefault();
        showPanel(i);
        closeSidebar();
      });
      li.appendChild(a);
      menu.appendChild(li);
    });
  }

  function buildPanelDots() {
    const wrap = $("#panel-dots");
    PANELS.forEach((_, i) => {
      const dot = el("button", {
        class: "panel-dot" + (i === 0 ? " active" : ""),
        attrs: { type: "button", "aria-label": "Go to section " + (i + 1) },
      });
      dot.addEventListener("click", () => showPanel(i));
      wrap.appendChild(dot);
    });
  }

  function showPanel(index) {
    if (index < 0 || index >= PANELS.length) return;

    /* Hide current */
    const prevEl = $(".panel.active");
    if (prevEl) prevEl.classList.remove("active");

    /* Show next */
    currentPanelIndex = index;
    const id     = PANELS[index].id;
    const panelEl = $("#panel-" + id);
    if (panelEl) {
      panelEl.classList.add("active");
      /* Scroll panel to top on change */
      panelEl.scrollTop = 0;
    }

    /* Update sidebar links */
    $$(".sidebar-menu a").forEach((a, i) =>
      a.classList.toggle("active", i === index)
    );

    /* Update dots */
    $$(".panel-dot").forEach((d, i) =>
      d.classList.toggle("active", i === index)
    );

    /* Update topbar */
    const topbarSection = $("#topbar-section");
    const topbarCount   = $("#topbar-count");
    if (topbarSection) topbarSection.textContent = PANELS[index].label;
    if (topbarCount)   topbarCount.textContent   = (index + 1) + " / " + PANELS.length;

    /* Update prev/next buttons */
    const btnPrev = $("#btn-prev");
    const btnNext = $("#btn-next");
    if (btnPrev) btnPrev.disabled = index === 0;
    if (btnNext) {
      btnNext.disabled = index === PANELS.length - 1;
      /* Toggle accent class only when not last */
      btnNext.classList.toggle("nav-btn--next", true);
    }

    /* Update URL hash */
    history.replaceState(null, "", "#" + id);

    /* Trigger reveal animations in the newly visible panel */
    observeReveals();
  }

  function wirePanelNav() {
    $("#btn-prev").addEventListener("click", () => showPanel(currentPanelIndex - 1));
    $("#btn-next").addEventListener("click", () => showPanel(currentPanelIndex + 1));

    /* Keyboard arrow navigation */
    document.addEventListener("keydown", (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") showPanel(currentPanelIndex + 1);
      if (e.key === "ArrowLeft"  || e.key === "ArrowUp")   showPanel(currentPanelIndex - 1);
    });

    /* data-panel links inside panels (overview quick-nav, etc.) */
    document.addEventListener("click", (e) => {
      const target = e.target.closest("[data-panel]");
      if (!target) return;
      /* Sidebar links are handled above; handle content links here */
      if (target.closest(".sidebar-menu")) return;
      const panelId = target.dataset.panel;
      const idx = PANELS.findIndex((p) => p.id === panelId);
      if (idx !== -1) { e.preventDefault(); showPanel(idx); }
    });
  }

  /* Restore from URL hash on load */
  function restoreFromHash() {
    const hash = location.hash.replace("#", "");
    const idx  = PANELS.findIndex((p) => p.id === hash);
    showPanel(idx >= 0 ? idx : 0);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     SIDEBAR MOBILE TOGGLE
     ═══════════════════════════════════════════════════════════════════════ */

  function openSidebar() {
    $("#sidebar").classList.add("open");
    $("#sidebar-overlay").classList.add("visible");
    $("#menu-toggle").setAttribute("aria-expanded", "true");
  }

  function closeSidebar() {
    $("#sidebar").classList.remove("open");
    $("#sidebar-overlay").classList.remove("visible");
    $("#menu-toggle").setAttribute("aria-expanded", "false");
  }

  function wireSidebarToggle() {
    $("#menu-toggle").addEventListener("click", () => {
      const isOpen = $("#sidebar").classList.contains("open");
      isOpen ? closeSidebar() : openSidebar();
    });
    $("#sidebar-close").addEventListener("click", closeSidebar);
    $("#sidebar-overlay").addEventListener("click", closeSidebar);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     STATIC CONTENT RENDERING
     ═══════════════════════════════════════════════════════════════════════ */

  function renderStaticContent() {
    /* Overview */
    $("#hero-tagline").textContent = data.org.tagline;

    /* Stats */
    const totalMembers = memberIndex.length;
    const stats = [
      { n: data.areas.length,  label: "Areas of support" },
      { n: totalMembers,       label: "Team members" },
      { n: data.tiers.length,  label: "Tiers of support" },
    ];
    const statsWrap = $("#hero-stats");
    stats.forEach((s) => {
      const d = el("div");
      d.appendChild(el("dt", { text: String(s.n) }));
      d.appendChild(el("dd", { text: s.label }));
      statsWrap.appendChild(d);
    });

    /* Overview quick-nav cards */
    const overviewCards = $("#overview-cards");
    const navItems = PANELS.slice(1);   /* skip Overview itself */
    navItems.forEach((p) => {
      const btn = el("button", { class: "overview-card", attrs: { type: "button", "data-panel": p.id } });
      const icon = el("span", { class: "overview-card-icon", html: ICONS[p.icon] || "" });
      btn.appendChild(icon);
      btn.appendChild(document.createTextNode(p.label));
      overviewCards.appendChild(btn);
    });

    /* Who We Are */
    $("#who-intro").textContent = data.whoWeAre.intro;
    listItems($("#grounded-in"),     data.whoWeAre.groundedIn);
    listItems($("#work-alongside"),  data.whoWeAre.workAlongside);
    $("#who-summary").textContent = data.whoWeAre.summary;

    /* Why It Matters */
    $("#why-intro").textContent = data.whyItMatters.intro;
    const whyWrap = $("#why-highlights");
    data.whyItMatters.highlights.forEach((text, i) => {
      const card = el("div", { class: "highlight-card" });
      card.appendChild(el("span", { class: "hc-num", text: "0" + (i + 1) }));
      card.appendChild(el("p", { text }));
      whyWrap.appendChild(card);
    });
    listItems($("#why-prioritizes"), data.whyItMatters.prioritizes);
    listItems($("#why-strategic"),   data.whyItMatters.strategicPlan);

    /* How We Support */
    $("#support-intro").textContent = data.howWeSupport.intro;
    listItems($("#support-actions"), data.howWeSupport.actions);

    /* Using Data */
    listItems($("#data-sources"), data.dataSources);
    listItems($("#data-ensures"), data.dataEnsures);

    /* For Schools */
    const sbIntro = $("#school-based-intro");
    data.schoolBased.intro.forEach((p) => sbIntro.appendChild(el("p", { text: p })));
    $("#equity-intro").textContent = data.schoolBased.equityModelIntro;

    const equityWrap = $("#equity-tiers");
    data.tiers.forEach((tier, i) => {
      const card = el("div", { class: "equity-card t" + (i + 1) });
      card.appendChild(el("span", { class: "ec-level", text: tier.level }));
      card.appendChild(el("h4",   { text: tier.name }));
      card.appendChild(el("p",    { text: tier.summary }));
      equityWrap.appendChild(card);
    });

    $("#embedded-intro").textContent = data.schoolBased.embeddedRationale.intro;
    listItems($("#embedded-factors"), data.schoolBased.embeddedRationale.factors);

    const dirWrap = $("#current-direction");
    data.schoolBased.currentDirection.forEach((block) => {
      const b  = el("div", { class: "direction-block" });
      b.appendChild(el("h4", { text: block.title }));
      const ul = el("ul");
      block.points.forEach((p) => ul.appendChild(el("li", { text: p })));
      b.appendChild(ul);
      dirWrap.appendChild(b);
    });

    /* Looking Ahead */
    $("#ahead-intro").textContent = data.lookingAhead.intro;
    listItems($("#ahead-points"), data.lookingAhead.points);
    $("#ahead-mentorship").textContent = data.lookingAhead.mentorship;

    /* Contact — show leadership team with headshots */
    const contactWrap = $("#contact-leaders");
    data.areas[0].members.slice(0, 3).forEach((m) => {
      const card = el("div", { class: "contact-card" });
      const hs   = makeHeadshot(m, 64);
      card.appendChild(hs);
      card.appendChild(el("p", { class: "cc-name", text: m.name }));
      card.appendChild(el("p", { class: "cc-role", text: m.role }));
      contactWrap.appendChild(card);
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════
     TIER EXPLORER
     ═══════════════════════════════════════════════════════════════════════ */

  function renderTiers() {
    const tabs  = $("#tier-tabs");
    const panel = $("#tier-panel");

    function showTier(tier) {
      panel.innerHTML = "";
      panel.appendChild(el("span", { class: "tp-badge",   text: tier.level }));
      panel.appendChild(el("h3",   {                      text: tier.name }));
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
      tab.appendChild(el("span", { class: "tt-name",  text: tier.name }));
      tab.addEventListener("click", () => {
        $$(".tier-tab", tabs).forEach((t) => t.setAttribute("aria-selected", "false"));
        tab.setAttribute("aria-selected", "true");
        showTier(tier);
      });
      tabs.appendChild(tab);
    });

    showTier(data.tiers[0]);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     TEAM DIRECTORY
     ═══════════════════════════════════════════════════════════════════════ */

  let activeFilter = "all";
  let activeQuery  = "";

  function buildMemberCard(member) {
    const card = el("button", { class: "member-card", attrs: { type: "button" } });
    card.appendChild(makeHeadshot(member, 48));
    const info = el("div", { class: "member-info" });
    info.appendChild(el("span", { class: "member-name", html: highlight(member.name, activeQuery) }));
    info.appendChild(el("span", { class: "member-role", html: highlight(member.role, activeQuery) }));
    card.appendChild(info);
    card.appendChild(el("span", { class: "view-bio", text: "View bio →" }));
    card.addEventListener("click", () => openModal(member));
    return card;
  }

  function memberMatches(member) {
    if (!activeQuery) return true;
    const q = activeQuery.toLowerCase();
    return member.name.toLowerCase().includes(q) || member.role.toLowerCase().includes(q);
  }

  function renderTeam() {
    const wrap = $("#team-areas");
    wrap.innerHTML = "";
    let visibleCount = 0;

    data.areas.forEach((area) => {
      if (activeFilter !== "all" && activeFilter !== area.id) return;

      const directMatches  = (area.members  || []).filter(memberMatches);
      const subteamMatches = (area.subteams || [])
        .map((st) => ({ name: st.name, members: st.members.filter(memberMatches) }))
        .filter((st) => st.members.length > 0);

      if (!directMatches.length && !subteamMatches.length) return;

      visibleCount +=
        directMatches.length +
        subteamMatches.reduce((n, st) => n + st.members.length, 0);

      const block = el("div", { class: "area-block reveal", attrs: { id: "area-" + area.id } });

      /* Header */
      const header  = el("div", { class: "area-header" });
      const areaIcon = el("div", { class: "area-icon", html: ICONS[area.icon] || "" });
      header.appendChild(areaIcon);
      const heading = el("div", { class: "area-heading" });
      const h3 = el("h3");
      h3.appendChild(el("span", { class: "area-num", text: area.number + "." }));
      h3.appendChild(document.createTextNode(" " + area.name + " "));
      if (area.subtitle) h3.appendChild(el("span", { class: "area-sub", text: "· " + area.subtitle }));
      heading.appendChild(h3);
      heading.appendChild(el("p", { class: "area-purpose", text: area.purpose }));
      header.appendChild(heading);
      block.appendChild(header);

      /* Key work + process */
      if (!activeQuery) {
        const meta = el("div", { class: "area-meta" });
        const kw   = el("div", { class: "keywork-card" });
        kw.appendChild(el("h4", { text: "Key Work" }));
        const kwList = el("ul", { class: "check-list" });
        (area.keyWork || []).forEach((t) => kwList.appendChild(el("li", { text: t })));
        kw.appendChild(kwList);
        meta.appendChild(kw);

        if (area.process) {
          const pc = el("div", { class: "process-card" });
          pc.appendChild(el("h4", { text: area.process.title }));
          pc.appendChild(el("p",  { class: "muted", text: area.process.intro }));
          const steps = el("ol", { class: "process-steps" });
          area.process.steps.forEach((s) => steps.appendChild(el("li", { text: s })));
          pc.appendChild(steps);
          meta.appendChild(pc);
        }
        block.appendChild(meta);
      }

      /* Direct members */
      if (directMatches.length) {
        const grid = el("div", { class: "member-grid" });
        directMatches.forEach((m) => grid.appendChild(buildMemberCard(m)));
        block.appendChild(grid);
      }

      /* Sub-team members */
      subteamMatches.forEach((st) => {
        block.appendChild(el("p", { class: "subteam-label", text: st.name }));
        const grid = el("div", { class: "member-grid" });
        st.members.forEach((m) => grid.appendChild(buildMemberCard(m)));
        block.appendChild(grid);
      });

      wrap.appendChild(block);
    });

    const noResults = $("#no-results");
    const countEl   = $("#results-count");
    if (visibleCount === 0) {
      noResults.hidden = false;
      countEl.textContent = "";
    } else {
      noResults.hidden = true;
      countEl.textContent =
        activeQuery || activeFilter !== "all"
          ? `Showing ${visibleCount} team member${visibleCount === 1 ? "" : "s"}`
          : `${visibleCount} team members across ${data.areas.length} areas of support`;
    }

    observeReveals();
  }

  function renderFilters() {
    const wrap = $("#area-filters");
    [{ id: "all", name: "All areas" }].concat(data.areas.map((a) => ({ id: a.id, name: a.name }))).forEach((f) => {
      const chip = el("button", {
        class: "chip",
        text: f.name,
        attrs: { type: "button", "aria-pressed": f.id === "all" ? "true" : "false", "data-filter": f.id },
      });
      chip.addEventListener("click", () => {
        activeFilter = f.id;
        $$(".chip", wrap).forEach((c) => c.setAttribute("aria-pressed", c === chip ? "true" : "false"));
        renderTeam();
      });
      wrap.appendChild(chip);
    });
  }

  function wireSearch() {
    const input = $("#team-search");
    let timer;
    input.addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(() => { activeQuery = input.value.trim(); renderTeam(); }, 120);
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════
     MODAL
     ═══════════════════════════════════════════════════════════════════════ */

  let lastFocused = null;

  function openModal(member) {
    lastFocused = document.activeElement;
    const modal = $("#member-modal");
    /* Headshot */
    const headshot = $("#modal-headshot");
    headshot.src = member.photo || PLACEHOLDER_PHOTO;
    headshot.alt = member.name;
    /* Text */
    $("#modal-name").textContent = member.name;
    $("#modal-role").textContent = member.role;
    $("#modal-area").textContent = member.areaName + (member.subteam ? " · " + member.subteam : "");
    $("#modal-bio").textContent  = member.bio;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    $(".modal-close", modal).focus();
  }

  function closeModal() {
    const modal = $("#member-modal");
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  function wireModal() {
    const modal = $("#member-modal");
    modal.addEventListener("click", (e) => { if (e.target.hasAttribute("data-close")) closeModal(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) closeModal(); });
  }

  /* ═══════════════════════════════════════════════════════════════════════
     REVEAL ON SCROLL (within active panel)
     ═══════════════════════════════════════════════════════════════════════ */

  let revealObserver;
  function observeReveals() {
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("in");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08 }
      );
    }
    $$(".reveal:not(.in)").forEach((node) => revealObserver.observe(node));
  }

  /* ═══════════════════════════════════════════════════════════════════════
     INIT
     ═══════════════════════════════════════════════════════════════════════ */

  function init() {
    if (!data) return;

    buildSidebarMenu();
    buildPanelDots();
    renderStaticContent();
    renderTiers();
    renderFilters();
    renderTeam();
    wireSearch();
    wireModal();
    wireSidebarToggle();
    wirePanelNav();
    restoreFromHash();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
