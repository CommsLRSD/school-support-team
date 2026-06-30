/*
 * Interactivity for the School & Classroom Support Team dashboard.
 * Renders content from data.js, handles panel navigation, sidebar toggle,
 * tier explorer, team search/filter, member bio modals, and prev/next
 * "slideshow" navigation through sections.
 *
 * No build step or framework required — plain, dependency-free JavaScript.
 */
(function () {
  "use strict";

  const data = window.SCST;
  const MAX_SUPPORT_ACTIONS = 4;
  const DARK_TIER_INDEX = 1;
  const DIRECTOR_ROLE_PATTERN = /director/i;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ─────────────────────────────────────────────────────────── Utilities */

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

  function listItems(parent, items) {
    if (!parent) return;
    parent.innerHTML = "";
    items.forEach((text) => parent.appendChild(el("li", { text })));
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  }

  function highlight(text, query) {
    const safe = escapeHtml(text);
    if (!query) return safe;
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return safe.replace(new RegExp("(" + escapedQuery + ")", "gi"), "<mark>$1</mark>");
  }

  // Inline SVG icons keyed by area id.
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

  /* ─────────────────────────────────────────── Section navigation (panels) */

  const SECTIONS = [
    { id: "overview", panel: "panel-overview" },
    { id: "why",      panel: "panel-why"      },
    { id: "support",  panel: "panel-support"  },
    { id: "data",     panel: "panel-data"     },
    { id: "team",     panel: "panel-team"     },
    { id: "schools",  panel: "panel-schools"  },
    { id: "ahead",    panel: "panel-ahead"    },
    { id: "contact",  panel: "panel-contact"  },
  ];

  let currentSectionIndex = 0;

  function showSection(index) {
    if (index < 0 || index >= SECTIONS.length) return;
    currentSectionIndex = index;
    const section = SECTIONS[index];

    // Show/hide panels
    SECTIONS.forEach(({ panel }) => {
      const el = $("#" + panel);
      if (el) el.hidden = true;
    });
    const activePanel = $("#" + section.panel);
    if (activePanel) {
      activePanel.hidden = false;
      // Re-trigger entrance animation by resetting
      activePanel.style.animation = "none";
      activePanel.offsetHeight; // reflow
      activePanel.style.animation = "";
    }

    // Update sidebar nav active state
    $$(".nav-list-item").forEach((link) => {
      const isActive = link.dataset.section === section.id;
      link.classList.toggle("active", isActive);
      link.setAttribute("aria-current", isActive ? "page" : "false");
    });

    // Update prev/next buttons and counter
    const prevBtn = $("#prev-btn");
    const nextBtn = $("#next-btn");
    const counter = $("#pag-counter");

    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === SECTIONS.length - 1;
    if (counter) counter.textContent = (index + 1) + " / " + SECTIONS.length;

    // If navigating to the team panel, trigger reveal observers
    if (section.id === "team") {
      setTimeout(observeReveals, 50);
    }

    // Scroll the main content to top
    const body = $(".content-body");
    if (body) body.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function wireNavigation() {
    // Sidebar nav links
    $$(".nav-list-item").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const sectionId = link.dataset.section;
        const idx = SECTIONS.findIndex((s) => s.id === sectionId);
        if (idx !== -1) {
          showSection(idx);
          closeSidebar(); // close on mobile
        }
      });
    });

    // Prev / Next buttons
    const prevBtn = $("#prev-btn");
    const nextBtn = $("#next-btn");

    if (prevBtn) prevBtn.addEventListener("click", () => showSection(currentSectionIndex - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => showSection(currentSectionIndex + 1));

    // Keyboard shortcut: left/right arrow keys when not focused in inputs
    document.addEventListener("keydown", (e) => {
      const tag = document.activeElement.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "ArrowRight") showSection(currentSectionIndex + 1);
      if (e.key === "ArrowLeft")  showSection(currentSectionIndex - 1);
    });
  }

  /* ─────────────────────────────────────────────── Mobile sidebar toggle */

  function openSidebar() {
    const sidebar  = $("#sidebar");
    const overlay  = $("#sidebar-overlay");
    const toggleBtn = $("#sidebar-toggle-btn");
    if (sidebar)  sidebar.classList.add("open");
    if (overlay)  overlay.classList.add("open");
    if (toggleBtn) toggleBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  function closeSidebar() {
    const sidebar  = $("#sidebar");
    const overlay  = $("#sidebar-overlay");
    const toggleBtn = $("#sidebar-toggle-btn");
    if (sidebar)  sidebar.classList.remove("open");
    if (overlay)  overlay.classList.remove("open");
    if (toggleBtn) toggleBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  function wireSidebarToggle() {
    const toggleBtn = $("#sidebar-toggle-btn");
    const overlay   = $("#sidebar-overlay");

    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        const sidebar = $("#sidebar");
        if (sidebar && sidebar.classList.contains("open")) {
          closeSidebar();
        } else {
          openSidebar();
        }
      });
    }

    if (overlay) {
      overlay.addEventListener("click", closeSidebar);
    }

    // Close sidebar on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const sidebar = $("#sidebar");
        if (sidebar && sidebar.classList.contains("open")) closeSidebar();
      }
    });
  }

  /* ─────────────────────────────────────────────────── Flatten members */

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

  /* ──────────────────────────────────────────────────── Static content */

  function renderStaticContent() {
    // Who we are
    const whoIntro = $("#who-intro");
    if (whoIntro) whoIntro.textContent = data.whoWeAre.intro;
    listItems($("#grounded-in"),    data.whoWeAre.groundedIn);
    listItems($("#work-alongside"), data.whoWeAre.workAlongside);
    const whoSummary = $("#who-summary");
    if (whoSummary) whoSummary.textContent = data.whoWeAre.summary;

    // Stats
    const totalMembers = memberIndex.length;
    const stats = [
      { n: data.areas.length,   label: "Areas of support" },
      { n: totalMembers,        label: "Team members"      },
      { n: data.tiers.length,   label: "Tiers of support"  },
    ];
    const statsWrap = $("#hero-stats");
    if (statsWrap) {
      stats.forEach((s) => {
        const div = el("div");
        div.appendChild(el("dt", { text: String(s.n) }));
        div.appendChild(el("dd", { text: s.label }));
        statsWrap.appendChild(div);
      });
    }

    // Why it matters
    const whyIntro = $("#why-intro");
    if (whyIntro) whyIntro.textContent = data.whyItMatters.intro;

    const whyWrap = $("#why-walkthrough");
    if (whyWrap) {
      data.whyItMatters.highlights.forEach((text, i) => {
        const cardClass = i % 2 === 1 ? "highlight-card highlight-card-dark" : "highlight-card";
        const card = el("div", { class: cardClass });
        card.appendChild(el("span", { class: "hc-num", text: "0" + (i + 1) }));
        card.appendChild(el("p", { text }));
        whyWrap.appendChild(card);
      });

      const prioritizeCard = el("div", { class: "info-card" });
      prioritizeCard.appendChild(el("h3", { text: "How we prioritize support" }));
      const prioritizeList = el("ul", { class: "check-list" });
      data.whyItMatters.prioritizes.forEach((text) => prioritizeList.appendChild(el("li", { text })));
      prioritizeCard.appendChild(prioritizeList);
      whyWrap.appendChild(prioritizeCard);

      const strategicCard = el("div", { class: "info-card info-card-accent" });
      strategicCard.appendChild(el("h3", { text: "Advancing the Multi-Year Strategic Plan" }));
      const strategicList = el("ul", { class: "tag-list" });
      data.whyItMatters.strategicPlan.forEach((text) => strategicList.appendChild(el("li", { text })));
      strategicCard.appendChild(strategicList);
      whyWrap.appendChild(strategicCard);
    }

    // How we support
    const supportIntro = $("#support-intro");
    if (supportIntro) supportIntro.textContent = data.howWeSupport.intro;
    const supportActions = data.howWeSupport.actions || [];
    const supportActionList = $("#support-actions");
    if (supportActionList) {
      listItems(supportActionList, supportActions.slice(0, MAX_SUPPORT_ACTIONS));
      if (supportActions.length > MAX_SUPPORT_ACTIONS) {
        const hiddenCount = supportActions.length - MAX_SUPPORT_ACTIONS;
        supportActionList.appendChild(
          el("li", { class: "pill-list-more", text: `+${hiddenCount} more ways we support schools` })
        );
      }
    }

    // Data
    listItems($("#data-sources"), data.dataSources);
    listItems($("#data-ensures"), data.dataEnsures);

    // School-based support
    const sbIntro = $("#school-based-intro");
    if (sbIntro) {
      data.schoolBased.intro.forEach((p) => sbIntro.appendChild(el("p", { text: p })));
    }
    const equityIntro = $("#equity-intro");
    if (equityIntro) equityIntro.textContent = data.schoolBased.equityModelIntro;

    const schoolsWalkthrough = $("#schools-walkthrough");
    if (schoolsWalkthrough) {
      data.tiers.forEach((tier, i) => {
        const classes = ["equity-card", "t" + (i + 1), i === DARK_TIER_INDEX && "equity-card-dark"]
          .filter(Boolean)
          .join(" ");
        const card = el("div", { class: classes });
        card.appendChild(el("span", { class: "ec-level", text: tier.level }));
        card.appendChild(el("h4", { text: tier.name }));
        card.appendChild(el("p", { text: tier.summary }));
        schoolsWalkthrough.appendChild(card);
      });

      const embeddedCard = el("div", { class: "info-card" });
      embeddedCard.appendChild(el("h3", { text: "Embedded Support Rationale" }));
      embeddedCard.appendChild(
        el("p", { class: "muted-text", text: data.schoolBased.embeddedRationale.intro })
      );
      const embeddedList = el("ul", { class: "check-list" });
      data.schoolBased.embeddedRationale.factors.forEach((text) =>
        embeddedList.appendChild(el("li", { text }))
      );
      embeddedCard.appendChild(embeddedList);
      schoolsWalkthrough.appendChild(embeddedCard);

      const directionCard = el("div", { class: "info-card info-card-accent" });
      directionCard.appendChild(el("h3", { text: "Instructional Support — Current Direction" }));
      data.schoolBased.currentDirection.forEach((block) => {
        const b = el("div", { class: "direction-block" });
        b.appendChild(el("h4", { text: block.title }));
        const ul = el("ul");
        block.points.forEach((p) => ul.appendChild(el("li", { text: p })));
        b.appendChild(ul);
        directionCard.appendChild(b);
      });
      schoolsWalkthrough.appendChild(directionCard);
    }

    // Looking ahead
    const aheadIntro = $("#ahead-intro");
    if (aheadIntro) aheadIntro.textContent = data.lookingAhead.intro;
    listItems($("#ahead-points"), data.lookingAhead.points);
    const aheadMentorship = $("#ahead-mentorship");
    if (aheadMentorship) aheadMentorship.textContent = data.lookingAhead.mentorship;

    // Contact — leadership team (first 3 leaders)
    const contactWrap = $("#contact-leaders");
    if (contactWrap) {
      data.areas[0].members.slice(0, 3).forEach((m) => {
        const cardClass = DIRECTOR_ROLE_PATTERN.test(m.role)
          ? "contact-card contact-card-dark"
          : "contact-card";
        const card = el("div", { class: cardClass });
        const photo = el("img", {
          class: "contact-photo",
          attrs: { src: "assets/placeholder-headshot.jpg", alt: m.name },
        });
        card.appendChild(photo);
        card.appendChild(el("p", { class: "cc-name", text: m.name }));
        card.appendChild(el("p", { class: "cc-role", text: m.role }));
        contactWrap.appendChild(card);
      });
    }
  }

  function initFocusCarousels() {
    $$(".focus-carousel").forEach((wrap, carouselIndex) => {
      const items = Array.from(wrap.children);
      if (items.length <= 1) return;
      if (wrap.classList.contains("carousel-ready")) return;
      wrap.classList.add("carousel-ready");

      let currentIndex = 0;
      wrap.classList.add("is-carousel");
      items.forEach((item, i) => {
        item.classList.add("carousel-item");
        const itemSummaryNode = item.querySelector("h3, h4, .cc-name, p");
        const itemSummary = itemSummaryNode
          ? itemSummaryNode.textContent.trim().slice(0, 80)
          : "highlight";
        item.setAttribute("aria-label", `Card ${i + 1} of ${items.length}: ${itemSummary}`);
        item.hidden = i !== currentIndex;
      });
      wrap.setAttribute("role", "region");
      const panel = wrap.closest(".content-panel");
      const panelLabelNode = panel && (panel.querySelector(".panel-eyebrow") || panel.querySelector("h2"));
      const panelLabel = panelLabelNode ? panelLabelNode.textContent.trim() : "Section highlights";
      wrap.setAttribute("aria-label", panelLabel);

      const controls = el("div", { class: "focus-carousel-controls" });
      const prevBtn = el("button", {
        class: "carousel-btn",
        text: "Previous",
        attrs: { type: "button", "aria-label": "Show previous item" },
      });
      const status = el("span", { class: "carousel-status", attrs: { "aria-live": "polite" } });
      const nextBtn = el("button", {
        class: "carousel-btn",
        text: "Next",
        attrs: { type: "button", "aria-label": "Show next item" },
      });

      function renderCarouselItem() {
        items.forEach((item, i) => {
          item.hidden = i !== currentIndex;
          item.classList.toggle("is-active", i === currentIndex);
          item.setAttribute("tabindex", i === currentIndex ? "0" : "-1");
        });
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex === items.length - 1;
        status.textContent = `${currentIndex + 1} / ${items.length}`;
      }

      prevBtn.addEventListener("click", () => {
        if (currentIndex === 0) return;
        currentIndex -= 1;
        renderCarouselItem();
        items[currentIndex].focus({ preventScroll: true });
      });
      nextBtn.addEventListener("click", () => {
        if (currentIndex === items.length - 1) return;
        currentIndex += 1;
        renderCarouselItem();
        items[currentIndex].focus({ preventScroll: true });
      });

      controls.appendChild(prevBtn);
      controls.appendChild(status);
      controls.appendChild(nextBtn);
      controls.id = `focus-carousel-controls-${carouselIndex}`;
      wrap.insertAdjacentElement("afterend", controls);
      renderCarouselItem();
    });
  }

  /* ──────────────────────────────────────────────────── Tier explorer */

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

  /* ──────────────────────────────────────────────────── Team areas */

  let activeFilter = "all";
  let activeQuery  = "";
  let activeMemberIndex = 0;

  function memberMatches(member) {
    if (!activeQuery) return true;
    const q = activeQuery.toLowerCase();
    return member.name.toLowerCase().includes(q) || member.role.toLowerCase().includes(q);
  }

  function getFilteredMembers() {
    return memberIndex.filter(
      (member) =>
        (activeFilter === "all" || member.areaId === activeFilter) &&
        memberMatches(member)
    );
  }

  function renderTeamContext(selectedMember) {
    const context = $("#team-context");
    if (!context) return;
    context.innerHTML = "";
    if (!selectedMember) return;
    const area = data.areas.find((entry) => entry.id === selectedMember.areaId);
    if (!area) return;

    const row = el("div", { class: "team-context-row" });
    row.appendChild(el("p", { class: "team-context-title", text: area.name }));
    row.appendChild(el("p", { class: "team-context-purpose", text: area.purpose }));
    context.appendChild(row);
  }

  function renderTeam() {
    const stage = $("#team-member-stage");
    if (!stage) return;
    stage.innerHTML = "";
    const visibleMembers = getFilteredMembers();
    const visibleCount = visibleMembers.length;

    // Results count + empty state
    const noResults = $("#no-results");
    const countEl   = $("#results-count");
    if (visibleCount === 0) {
      if (noResults) noResults.hidden = false;
      if (countEl)   countEl.textContent = "";
      renderTeamContext(null);
      return;
    }
    if (noResults) noResults.hidden = true;

    if (activeMemberIndex > visibleMembers.length - 1) {
      activeMemberIndex = visibleMembers.length - 1;
    }
    if (activeMemberIndex < 0) activeMemberIndex = 0;
    const selectedMember = visibleMembers[activeMemberIndex];
    renderTeamContext(selectedMember);

    if (countEl) {
      const label =
        activeQuery || activeFilter !== "all"
          ? `Showing ${visibleCount} team member${visibleCount === 1 ? "" : "s"}`
          : `${visibleCount} team members across ${data.areas.length} areas of support`;
      countEl.textContent = label;
    }

    const selector = el("div", {
      class: "member-selector-strip",
      attrs: { role: "tablist", "aria-label": "Choose a team member" },
    });
    visibleMembers.forEach((member, index) => {
      const chip = el("button", {
        class: "member-chip" + (index === activeMemberIndex ? " is-active" : ""),
        html: highlight(member.name, activeQuery),
        attrs: {
          type: "button",
          role: "tab",
          "aria-selected": index === activeMemberIndex ? "true" : "false",
        },
      });
      chip.addEventListener("click", () => {
        activeMemberIndex = index;
        renderTeam();
      });
      selector.appendChild(chip);
    });
    stage.appendChild(selector);

    const focusCard = el("article", { class: "team-focus-card" });
    const focusHeader = el("div", { class: "team-focus-head" });
    const photo = el("img", {
      class: "team-focus-photo",
      attrs: { src: "assets/placeholder-headshot.jpg", alt: selectedMember.name },
    });
    focusHeader.appendChild(photo);
    const focusInfo = el("div", { class: "team-focus-info" });
    focusInfo.appendChild(el("h3", { html: highlight(selectedMember.name, activeQuery) }));
    focusInfo.appendChild(el("p", { class: "team-focus-role", html: highlight(selectedMember.role, activeQuery) }));
    const areaLabel = selectedMember.areaName + (selectedMember.subteam ? " · " + selectedMember.subteam : "");
    focusInfo.appendChild(el("p", { class: "team-focus-area", text: areaLabel }));
    focusHeader.appendChild(focusInfo);
    focusCard.appendChild(focusHeader);
    focusCard.appendChild(el("p", { class: "team-focus-bio", text: selectedMember.bio }));

    const actions = el("div", { class: "team-focus-actions" });
    const prevBtn = el("button", {
      class: "team-pager-btn",
      text: "Previous",
      attrs: { type: "button", "aria-label": "Show previous team member" },
    });
    prevBtn.disabled = activeMemberIndex === 0;
    prevBtn.addEventListener("click", () => {
      if (activeMemberIndex === 0) return;
      activeMemberIndex -= 1;
      renderTeam();
    });

    const status = el("span", {
      class: "team-pager-status",
      text: `${activeMemberIndex + 1} / ${visibleMembers.length}`,
      attrs: { "aria-live": "polite" },
    });

    const nextBtn = el("button", {
      class: "team-pager-btn",
      text: "Next",
      attrs: { type: "button", "aria-label": "Show next team member" },
    });
    nextBtn.disabled = activeMemberIndex === visibleMembers.length - 1;
    nextBtn.addEventListener("click", () => {
      if (activeMemberIndex === visibleMembers.length - 1) return;
      activeMemberIndex += 1;
      renderTeam();
    });

    const bioBtn = el("button", {
      class: "team-bio-btn",
      text: "Open full bio",
      attrs: { type: "button" },
    });
    bioBtn.addEventListener("click", () => openModal(selectedMember));

    actions.appendChild(prevBtn);
    actions.appendChild(status);
    actions.appendChild(nextBtn);
    actions.appendChild(bioBtn);
    focusCard.appendChild(actions);
    stage.appendChild(focusCard);
  }

  function renderFilters() {
    const wrap = $("#area-filters");
    if (!wrap) return;
    const filters = [{ id: "all", name: "All areas" }].concat(
      data.areas.map((a) => ({ id: a.id, name: a.name }))
    );
    filters.forEach((f) => {
      const chip = el("button", {
        class: "chip",
        text: f.name,
        attrs: { type: "button", "aria-pressed": f.id === "all" ? "true" : "false", "data-filter": f.id },
      });
      chip.addEventListener("click", () => {
        activeFilter = f.id;
        activeMemberIndex = 0;
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
    if (!input) return;
    let timer;
    input.addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        activeQuery = input.value.trim();
        activeMemberIndex = 0;
        renderTeam();
      }, 120);
    });
  }

  /* ──────────────────────────────────────────────────── Modal */

  let lastFocused = null;

  function openModal(member) {
    lastFocused = document.activeElement;
    const modal = $("#member-modal");
    if (!modal) return;
    const photo = $("#modal-photo");
    if (photo) {
      photo.src = "assets/placeholder-headshot.jpg";
      photo.alt = member.name;
    }
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
    modal.addEventListener("click", (e) => {
      if (e.target.hasAttribute("data-close")) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.hidden) closeModal();
    });
  }

  /* ──────────────────────────────────────────────────── Reveal animation */

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

  /* ──────────────────────────────────────────────────── Init */

  function init() {
    if (!data) return;

    renderStaticContent();
    renderTiers();
    renderFilters();
    renderTeam();
    initFocusCarousels();
    wireSearch();
    wireModal();
    wireSidebarToggle();
    wireNavigation();

    // Show initial section
    showSection(0);

    // Trigger reveals for initial panel
    setTimeout(observeReveals, 100);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
