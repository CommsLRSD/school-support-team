/*
 * Interactivity for the School & Classroom Support Team web app.
 * Renders content from data.js and wires up navigation, the tier explorer,
 * team search/filter, member bio modals, and scroll behaviours.
 *
 * No build step or framework required — plain, dependency-free JavaScript.
 */
(function () {
  "use strict";

  const data = window.SCST;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------------------------------------------------------- Utilities */

  // Build an element with optional class, text and attributes.
  function el(tag, opts = {}) {
    const node = document.createElement(tag);
    if (opts.class) node.className = opts.class;
    if (opts.text != null) node.textContent = opts.text;
    if (opts.html != null) node.innerHTML = opts.html;
    if (opts.attrs) {
      Object.entries(opts.attrs).forEach(([k, v]) => node.setAttribute(k, v));
    }
    return node;
  }

  function listItems(parent, items, className) {
    if (!parent) return;
    parent.innerHTML = "";
    items.forEach((text) => parent.appendChild(el("li", { text, class: className })));
  }

  // Two-letter initials for avatars.
  function initials(name) {
    const parts = name.trim().split(/\s+/);
    const first = parts[0] ? parts[0][0] : "";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase();
  }

  // Deterministic accent colour per person so avatars are stable & varied.
  const AVATAR_COLORS = [
    "#1f8a8a",
    "#0f2a43",
    "#c0593f",
    "#7a5a13",
    "#2f6f4e",
    "#6a4a86",
    "#b3791f",
    "#356b9a",
  ];
  function avatarColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = (hash * 31 + name.charCodeAt(i)) % 100000;
    }
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
  }

  function makeAvatar(name) {
    const a = el("span", { class: "avatar", text: initials(name) });
    a.style.background = avatarColor(name);
    return a;
  }

  // Escape user-derived text before injecting as HTML (for highlight).
  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  }

  // Wrap matched query text in <mark>. Both inputs are plain text.
  function highlight(text, query) {
    const safe = escapeHtml(text);
    if (!query) return safe;
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return safe.replace(new RegExp("(" + escapedQuery + ")", "gi"), "<mark>$1</mark>");
  }

  // Inline SVG icons keyed by name.
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

  /* --------------------------------------------------- Flatten members */
  // Build a flat list of every member with their area context, for search.
  function buildMemberIndex() {
    const list = [];
    data.areas.forEach((area) => {
      const push = (member, subteam) =>
        list.push({ ...member, areaId: area.id, areaName: area.name, subteam });
      (area.members || []).forEach((m) => push(m, null));
      (area.subteams || []).forEach((st) =>
        (st.members || []).forEach((m) => push(m, st.name))
      );
    });
    return list;
  }
  const memberIndex = buildMemberIndex();

  /* ------------------------------------------------------ Static content */
  function renderStaticContent() {
    $("#hero-tagline").textContent = data.org.tagline;
    $("#footer-tagline").textContent = data.org.tagline;

    // Hero stats
    const totalMembers = memberIndex.length;
    const stats = [
      { n: data.areas.length, label: "Areas of support" },
      { n: totalMembers, label: "Team members" },
      { n: data.tiers.length, label: "Tiers of support" },
    ];
    const statsWrap = $("#hero-stats");
    stats.forEach((s) => {
      const d = el("div");
      d.appendChild(el("dt", { text: String(s.n) }));
      d.appendChild(el("dd", { text: s.label }));
      statsWrap.appendChild(d);
    });

    // Who we are
    $("#who-intro").textContent = data.whoWeAre.intro;
    listItems($("#grounded-in"), data.whoWeAre.groundedIn);
    listItems($("#work-alongside"), data.whoWeAre.workAlongside);
    $("#who-summary").textContent = data.whoWeAre.summary;

    // Why it matters
    $("#why-intro").textContent = data.whyItMatters.intro;
    const whyWrap = $("#why-highlights");
    data.whyItMatters.highlights.forEach((text, i) => {
      const card = el("div", { class: "highlight-card" });
      card.appendChild(el("span", { class: "hc-num", text: "0" + (i + 1) }));
      card.appendChild(el("p", { text }));
      whyWrap.appendChild(card);
    });
    listItems($("#why-prioritizes"), data.whyItMatters.prioritizes);
    listItems($("#why-strategic"), data.whyItMatters.strategicPlan);

    // How we support
    $("#support-intro").textContent = data.howWeSupport.intro;
    listItems($("#support-actions"), data.howWeSupport.actions);

    // Data
    listItems($("#data-sources"), data.dataSources);
    listItems($("#data-ensures"), data.dataEnsures);

    // School-based support
    const sbIntro = $("#school-based-intro");
    data.schoolBased.intro.forEach((p) => sbIntro.appendChild(el("p", { text: p })));
    $("#equity-intro").textContent = data.schoolBased.equityModelIntro;

    const equityWrap = $("#equity-tiers");
    data.tiers.forEach((tier, i) => {
      const card = el("div", { class: "equity-card t" + (i + 1) });
      card.appendChild(el("span", { class: "ec-level", text: tier.level }));
      card.appendChild(el("h4", { text: tier.name }));
      card.appendChild(el("p", { text: tier.summary }));
      equityWrap.appendChild(card);
    });

    $("#embedded-intro").textContent = data.schoolBased.embeddedRationale.intro;
    listItems($("#embedded-factors"), data.schoolBased.embeddedRationale.factors);

    const dirWrap = $("#current-direction");
    data.schoolBased.currentDirection.forEach((block) => {
      const b = el("div", { class: "direction-block" });
      b.appendChild(el("h4", { text: block.title }));
      const ul = el("ul");
      block.points.forEach((p) => ul.appendChild(el("li", { text: p })));
      b.appendChild(ul);
      dirWrap.appendChild(b);
    });

    // Looking ahead
    $("#ahead-intro").textContent = data.lookingAhead.intro;
    listItems($("#ahead-points"), data.lookingAhead.points);
    $("#ahead-mentorship").textContent = data.lookingAhead.mentorship;

    // Contact — leadership team
    const contactWrap = $("#contact-leaders");
    data.areas[0].members.slice(0, 3).forEach((m) => {
      const card = el("div", { class: "contact-card" });
      card.appendChild(makeAvatar(m.name));
      card.appendChild(el("p", { class: "cc-name", text: m.name }));
      card.appendChild(el("p", { class: "cc-role", text: m.role }));
      contactWrap.appendChild(card);
    });
  }

  /* -------------------------------------------------------- Tier explorer */
  function renderTiers() {
    const tabs = $("#tier-tabs");
    const panel = $("#tier-panel");

    function showTier(tier) {
      panel.innerHTML = "";
      panel.appendChild(el("span", { class: "tp-badge", text: tier.level }));
      panel.appendChild(el("h3", { text: tier.name }));
      panel.appendChild(el("p", { class: "tp-summary", text: tier.summary }));
      const ul = el("ul", { class: "check-list" });
      tier.includes.forEach((t) => ul.appendChild(el("li", { text: t })));
      panel.appendChild(ul);
      panel.appendChild(el("p", { class: "tp-goal", text: tier.goal }));
    }

    data.tiers.forEach((tier, i) => {
      const tab = el("button", {
        class: "tier-tab",
        attrs: {
          role: "tab",
          "aria-selected": i === 0 ? "true" : "false",
          type: "button",
        },
      });
      tab.appendChild(el("span", { class: "tt-level", text: tier.level }));
      tab.appendChild(el("span", { class: "tt-name", text: tier.name }));
      tab.addEventListener("click", () => {
        $$(".tier-tab", tabs).forEach((t) =>
          t.setAttribute("aria-selected", "false")
        );
        tab.setAttribute("aria-selected", "true");
        showTier(tier);
      });
      tabs.appendChild(tab);
    });

    showTier(data.tiers[0]);
  }

  /* ----------------------------------------------------------- Team areas */
  let activeFilter = "all";
  let activeQuery = "";

  function buildMemberCard(member) {
    const card = el("button", {
      class: "member-card",
      attrs: { type: "button" },
    });
    card.appendChild(makeAvatar(member.name));
    const info = el("div", { class: "member-info" });
    info.appendChild(
      el("span", { class: "member-name", html: highlight(member.name, activeQuery) })
    );
    info.appendChild(
      el("span", { class: "member-role", html: highlight(member.role, activeQuery) })
    );
    if (member.tags && member.tags.length) {
      const tagsEl = el("div", { class: "member-tags" });
      member.tags.slice(0, 3).forEach((tag) => {
        tagsEl.appendChild(el("span", { class: "member-tag", text: tag }));
      });
      info.appendChild(tagsEl);
    }
    card.appendChild(info);
    card.appendChild(el("span", { class: "view-bio", text: "View bio →" }));
    card.addEventListener("click", () => openModal(member));
    return card;
  }

  function memberMatches(member) {
    if (!activeQuery) return true;
    const q = activeQuery.toLowerCase();
    return (
      member.name.toLowerCase().includes(q) ||
      member.role.toLowerCase().includes(q) ||
      (member.tags || []).some((tag) => tag.toLowerCase().includes(q))
    );
  }

  function renderTeam() {
    const wrap = $("#team-areas");
    wrap.innerHTML = "";
    let visibleCount = 0;

    data.areas.forEach((area) => {
      if (activeFilter !== "all" && activeFilter !== area.id) return;

      // Gather matching members (including sub-teams).
      const directMatches = (area.members || []).filter(memberMatches);
      const subteamMatches = (area.subteams || [])
        .map((st) => ({ name: st.name, members: st.members.filter(memberMatches) }))
        .filter((st) => st.members.length > 0);

      const areaHasMatch =
        directMatches.length > 0 || subteamMatches.length > 0;
      if (!areaHasMatch) return;

      visibleCount +=
        directMatches.length +
        subteamMatches.reduce((n, st) => n + st.members.length, 0);

      const block = el("div", {
        class: "area-block reveal",
        attrs: { id: "area-" + area.id },
      });

      // Header
      const header = el("div", { class: "area-header" });
      const icon = el("div", { class: "area-icon", html: ICONS[area.icon] || "" });
      header.appendChild(icon);
      const heading = el("div", { class: "area-heading" });
      const h3 = el("h3");
      h3.appendChild(el("span", { class: "area-num", text: area.number + "." }));
      h3.appendChild(document.createTextNode(" " + area.name + " "));
      if (area.subtitle) {
        h3.appendChild(el("span", { class: "area-sub", text: "· " + area.subtitle }));
      }
      heading.appendChild(h3);
      heading.appendChild(el("p", { class: "area-purpose", text: area.purpose }));
      header.appendChild(heading);
      block.appendChild(header);

      // Key work + process (hidden while searching to focus on people)
      if (!activeQuery) {
        const meta = el("div", { class: "area-meta" });
        const kw = el("div", { class: "keywork-card" });
        kw.appendChild(el("h4", { text: "Key Work" }));
        const kwList = el("ul", { class: "check-list" });
        (area.keyWork || []).forEach((t) =>
          kwList.appendChild(el("li", { text: t }))
        );
        kw.appendChild(kwList);
        meta.appendChild(kw);

        if (area.process) {
          const pc = el("div", { class: "process-card" });
          pc.appendChild(el("h4", { text: area.process.title }));
          pc.appendChild(el("p", { class: "muted", text: area.process.intro }));
          const steps = el("ol", { class: "process-steps" });
          area.process.steps.forEach((s) =>
            steps.appendChild(el("li", { text: s }))
          );
          pc.appendChild(steps);
          meta.appendChild(pc);
        }
        block.appendChild(meta);
      }

      // Direct members
      if (directMatches.length) {
        const grid = el("div", { class: "member-grid" });
        directMatches.forEach((m) => grid.appendChild(buildMemberCard(m)));
        block.appendChild(grid);
      }

      // Sub-team members
      subteamMatches.forEach((st) => {
        block.appendChild(el("p", { class: "subteam-label", text: st.name }));
        const grid = el("div", { class: "member-grid" });
        st.members.forEach((m) => grid.appendChild(buildMemberCard(m)));
        block.appendChild(grid);
      });

      wrap.appendChild(block);
    });

    // Results count + empty state
    const noResults = $("#no-results");
    const countEl = $("#results-count");
    if (visibleCount === 0) {
      noResults.hidden = false;
      countEl.textContent = "";
    } else {
      noResults.hidden = true;
      const label =
        activeQuery || activeFilter !== "all"
          ? `Showing ${visibleCount} team member${visibleCount === 1 ? "" : "s"}`
          : `${visibleCount} team members across ${data.areas.length} areas of support`;
      countEl.textContent = label;
    }
  }

  function renderFilters() {
    const wrap = $("#area-filters");
    const filters = [{ id: "all", name: "All areas" }].concat(
      data.areas.map((a) => ({ id: a.id, name: a.name }))
    );
    filters.forEach((f) => {
      const chip = el("button", {
        class: "chip",
        text: f.name,
        attrs: {
          type: "button",
          "aria-pressed": f.id === "all" ? "true" : "false",
          "data-filter": f.id,
        },
      });
      chip.addEventListener("click", () => {
        activeFilter = f.id;
        $$(".chip", wrap).forEach((c) =>
          c.setAttribute("aria-pressed", c === chip ? "true" : "false")
        );
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
      timer = setTimeout(() => {
        activeQuery = input.value.trim();
        renderTeam();
      }, 120);
    });
  }

  /* --------------------------------------------------------------- Modal */
  let lastFocused = null;

  function getActivePanel() {
    return document.getElementById(activePanel);
  }

  function openModal(member) {
    lastFocused = document.activeElement;
    const modal = $("#member-modal");
    const avatar = $("#modal-avatar");
    avatar.textContent = initials(member.name);
    avatar.style.background = avatarColor(member.name);
    $("#modal-name").textContent = member.name;
    $("#modal-role").textContent = member.role;
    const areaLabel =
      member.areaName + (member.subteam ? " · " + member.subteam : "");
    $("#modal-area").textContent = areaLabel;
    $("#modal-bio").textContent = member.bio;
    const modalTags = $("#modal-tags");
    modalTags.innerHTML = "";
    if (member.tags && member.tags.length) {
      member.tags.forEach((tag) => {
        modalTags.appendChild(el("span", { class: "member-tag", text: tag }));
      });
    }
    // Lock the active panel's scroll so it doesn't scroll behind the modal
    const panel = getActivePanel();
    if (panel) panel.style.overflow = "hidden";
    modal.hidden = false;
    $(".modal-close", modal).focus();
  }

  function closeModal() {
    const modal = $("#member-modal");
    modal.hidden = true;
    // Restore active panel scroll
    const panel = getActivePanel();
    if (panel) panel.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  function wireModal() {
    const modal = $("#member-modal");
    modal.addEventListener("click", (e) => {
      if (e.target.hasAttribute("data-close")) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.hidden) closeModal();
    });
  }

  /* ---------------------------------------------------- Header & nav UX */
  function wireHeader() {
    // Mobile nav toggle only — header always shows border in panel layout
    const toggle = $(".nav-toggle");
    const menu = $("#nav-menu");
    if (toggle && menu) {
      toggle.addEventListener("click", () => {
        const open = menu.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
      });
    }
  }

  /* -------------------------------------------------------- Panel system */
  const HREF_TO_PANEL = {
    "#top":         "panel-home",
    "#who-we-are":  "panel-about",
    "#why":         "panel-about",
    "#support":     "panel-support",
    "#data":        "panel-support",
    "#team":        "panel-team",
    "#schools":     "panel-schools",
    "#ahead":       "panel-schools",
    "#contact":     "panel-contact",
  };

  const DEFAULT_PANEL = "panel-team";
  let activePanel = DEFAULT_PANEL;

  function updateNavActive() {
    $$(".nav-menu a").forEach((a) => {
      const href = a.getAttribute("href");
      const panelId = HREF_TO_PANEL[href];
      a.classList.toggle("active", panelId === activePanel);
    });
  }

  function showPanel(id) {
    $$(".panel").forEach((p) => {
      const isActive = p.id === id;
      p.classList.toggle("panel-active", isActive);
      p.setAttribute("aria-hidden", isActive ? "false" : "true");
    });
    activePanel = id;
    updateNavActive();
  }

  function wirePanels() {
    // Intercept any click on an element with data-panel
    document.addEventListener("click", (e) => {
      const trigger = e.target.closest("[data-panel]");
      if (!trigger) return;
      const panelId = trigger.getAttribute("data-panel");
      if (!panelId) return;
      e.preventDefault();
      showPanel(panelId);
      // Close mobile nav if open
      const menu = $("#nav-menu");
      const toggle = $(".nav-toggle");
      if (menu && menu.classList.contains("open")) {
        menu.classList.remove("open");
        toggle && toggle.setAttribute("aria-expanded", "false");
      }
    });

    // Show initial panel based on URL hash or default
    const hash = window.location.hash;
    const initial = (hash && HREF_TO_PANEL[hash]) || DEFAULT_PANEL;
    showPanel(initial);
  }

  // Reveal-on-scroll animation.
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
        { threshold: 0.12 }
      );
    }
    $$(".reveal:not(.in)").forEach((node) => revealObserver.observe(node));
  }

  /* ------------------------------------------------------------ Init */
  function init() {
    if (!data) return;
    renderStaticContent();
    renderTiers();
    renderFilters();
    renderTeam();
    wireSearch();
    wireModal();
    wireHeader();
    wirePanels();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
