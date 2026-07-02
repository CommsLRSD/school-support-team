(function () {
  "use strict";

  const data = window.SCST;
  if (!data) return;

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  function el(tag, opts = {}) {
    const node = document.createElement(tag);
    if (opts.class) node.className = opts.class;
    if (opts.text != null) node.textContent = opts.text;
    if (opts.html != null) node.innerHTML = opts.html;
    if (opts.attrs) {
      Object.entries(opts.attrs).forEach(([key, value]) => node.setAttribute(key, value));
    }
    return node;
  }

  function listItems(parent, items) {
    if (!parent) return;
    parent.innerHTML = "";
    items.forEach((item) => parent.appendChild(el("li", { text: item })));
  }

  function escapeHtml(text) {
    return text.replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  }

  function highlight(text, query) {
    const safeText = escapeHtml(text);
    if (!query) return safeText;
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return safeText.replace(new RegExp("(" + escapedQuery + ")", "gi"), "<mark>$1</mark>");
  }

  const iconMap = {
    compass: "🧭",
    book: "📘",
    users: "👥",
    feather: "🪶",
    heart: "💙",
    star: "⭐",
  };

  function buildMemberIndex() {
    const members = [];
    data.areas.forEach((area) => {
      const pushMember = (member, subteam) => {
        members.push({ ...member, areaId: area.id, areaName: area.name, subteam });
      };
      (area.members || []).forEach((member) => pushMember(member, null));
      (area.subteams || []).forEach((subteam) =>
        (subteam.members || []).forEach((member) => pushMember(member, subteam.name))
      );
    });
    return members;
  }

  const memberIndex = buildMemberIndex();
  let activeFilter = "all";
  let activeQuery = "";
  let lastFocused = null;

  function renderHero() {
    $("#hero-tagline").textContent = data.org.tagline;
    $("#hero-intro").textContent = data.whoWeAre.intro;

    const actions = [
      ["#support", "Jump to support tiers"],
      ["#team", "Find a team member"],
      ["#contact", "Open contact section"],
    ];

    const actionsWrap = $("#hero-actions");
    actionsWrap.innerHTML = "";
    actions.forEach(([href, label]) => {
      actionsWrap.appendChild(el("a", { text: label, attrs: { href } }));
    });
  }

  function renderWho() {
    $("#who-intro").textContent = data.whoWeAre.intro;
    listItems($("#grounded-in"), data.whoWeAre.groundedIn);
    listItems($("#work-alongside"), data.whoWeAre.workAlongside);
    $("#who-summary").textContent = data.whoWeAre.summary;

    const stats = [
      [data.areas.length, "Areas of support"],
      [memberIndex.length, "Team members"],
      [data.tiers.length, "Tiers of support"],
    ];

    const wrap = $("#hero-stats");
    wrap.innerHTML = "";
    stats.forEach(([value, label]) => {
      const card = el("article");
      card.appendChild(el("strong", { text: String(value) }));
      card.appendChild(el("span", { text: label }));
      wrap.appendChild(card);
    });
  }

  function renderImpact() {
    $("#why-intro").textContent = data.whyItMatters.intro;
    const wrap = $("#why-walkthrough");
    wrap.innerHTML = "";

    data.whyItMatters.highlights.forEach((item) => {
      const card = el("article", { class: "card" });
      card.appendChild(el("p", { text: item }));
      wrap.appendChild(card);
    });

    const priorities = el("article", { class: "card" });
    priorities.appendChild(el("h3", { text: "How we prioritize support" }));
    const prioritiesList = el("ul", { class: "check-list" });
    data.whyItMatters.prioritizes.forEach((item) => prioritiesList.appendChild(el("li", { text: item })));
    priorities.appendChild(prioritiesList);
    wrap.appendChild(priorities);

    const strategic = el("article", { class: "card" });
    strategic.appendChild(el("h3", { text: "Strategic plan alignment" }));
    const strategicList = el("ul", { class: "check-list" });
    data.whyItMatters.strategicPlan.forEach((item) => strategicList.appendChild(el("li", { text: item })));
    strategic.appendChild(strategicList);
    wrap.appendChild(strategic);
  }

  function renderSupport() {
    $("#support-intro").textContent = data.howWeSupport.intro;
    listItems($("#support-actions"), data.howWeSupport.actions);

    const tiersWrap = $("#tiers-grid");
    tiersWrap.innerHTML = "";
    data.tiers.forEach((tier) => {
      const card = el("article", { class: "card" });
      card.appendChild(el("p", { class: "eyebrow", text: tier.level }));
      card.appendChild(el("h3", { text: tier.name }));
      card.appendChild(el("p", { text: tier.summary }));
      const list = el("ul", { class: "check-list" });
      tier.includes.forEach((item) => list.appendChild(el("li", { text: item })));
      card.appendChild(list);
      card.appendChild(el("p", { text: tier.goal }));
      tiersWrap.appendChild(card);
    });
  }

  function applyAreaFilter(id) {
    activeFilter = id;
    $$(".chip", $("#area-filters")).forEach((chip) => {
      chip.classList.toggle("active", chip.dataset.filter === id);
    });
    renderTeam();
  }

  function renderAreas() {
    const wrap = $("#areas-grid");
    wrap.innerHTML = "";

    data.areas.forEach((area) => {
      const areaCard = el("article", { class: "card" });
      areaCard.appendChild(el("p", { class: "eyebrow", text: `${iconMap[area.icon] || "•"} ${area.name}` }));
      areaCard.appendChild(el("p", { text: area.purpose }));

      const workList = el("ul", { class: "check-list" });
      (area.keyWork || []).slice(0, 4).forEach((item) => workList.appendChild(el("li", { text: item })));
      areaCard.appendChild(workList);

      const btn = el("button", { text: "View team members", attrs: { type: "button" } });
      btn.addEventListener("click", () => {
        applyAreaFilter(area.id);
        document.getElementById("team").scrollIntoView({ behavior: "smooth", block: "start" });
      });
      areaCard.appendChild(btn);
      wrap.appendChild(areaCard);
    });
  }

  function renderFilters() {
    const filtersWrap = $("#area-filters");
    filtersWrap.innerHTML = "";
    [{ id: "all", name: "All areas" }]
      .concat(data.areas.map((area) => ({ id: area.id, name: area.name })))
      .forEach((filter) => {
        const chip = el("button", {
          class: "chip" + (filter.id === activeFilter ? " active" : ""),
          text: filter.name,
          attrs: { type: "button", "data-filter": filter.id },
        });
        chip.addEventListener("click", () => applyAreaFilter(filter.id));
        filtersWrap.appendChild(chip);
      });
  }

  function getFilteredMembers() {
    return memberIndex.filter((member) => {
      const areaMatch = activeFilter === "all" || member.areaId === activeFilter;
      if (!areaMatch) return false;
      if (!activeQuery) return true;
      const q = activeQuery.toLowerCase();
      return member.name.toLowerCase().includes(q) || member.role.toLowerCase().includes(q);
    });
  }

  function openModal(member) {
    lastFocused = document.activeElement;
    const modal = $("#member-modal");
    if (!modal) return;

    const areaLabel = member.areaName + (member.subteam ? " · " + member.subteam : "");
    $("#modal-name").textContent = member.name;
    $("#modal-role").textContent = member.role;
    $("#modal-area").textContent = areaLabel;
    $("#modal-bio").textContent = member.bio;

    const photo = $("#modal-photo");
    photo.src = "assets/placeholder-headshot.jpg";
    photo.alt = member.name;

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

  function renderTeam() {
    const members = getFilteredMembers();
    const grid = $("#team-grid");
    const noResults = $("#no-results");
    const results = $("#results-count");

    grid.innerHTML = "";
    if (!members.length) {
      noResults.hidden = false;
      results.textContent = "";
      return;
    }

    noResults.hidden = true;
    results.textContent = `Showing ${members.length} team member${members.length === 1 ? "" : "s"}`;

    members.forEach((member) => {
      const card = el("article", { class: "member-card" });
      card.appendChild(el("h3", { html: highlight(member.name, activeQuery) }));
      card.appendChild(el("p", { class: "member-role", html: highlight(member.role, activeQuery) }));

      const areaLabel = member.areaName + (member.subteam ? " · " + member.subteam : "");
      card.appendChild(el("p", { class: "member-area", text: areaLabel }));

      const preview = member.bio.length > 170 ? `${member.bio.slice(0, 170)}…` : member.bio;
      card.appendChild(el("p", { text: preview }));

      const btn = el("button", { text: "Open full bio", attrs: { type: "button" } });
      btn.addEventListener("click", () => openModal(member));
      card.appendChild(btn);

      grid.appendChild(card);
    });
  }

  function renderSchools() {
    const intro = $("#school-based-intro");
    intro.innerHTML = "";
    data.schoolBased.intro.forEach((paragraph) => intro.appendChild(el("p", { text: paragraph })));
    $("#equity-intro").textContent = data.schoolBased.equityModelIntro;

    const wrap = $("#schools-walkthrough");
    wrap.innerHTML = "";

    data.tiers.forEach((tier) => {
      const card = el("article", { class: "card" });
      card.appendChild(el("p", { class: "eyebrow", text: tier.level }));
      card.appendChild(el("h3", { text: tier.name }));
      card.appendChild(el("p", { text: tier.summary }));
      wrap.appendChild(card);
    });

    const rationale = el("article", { class: "card" });
    rationale.appendChild(el("h3", { text: "Embedded support rationale" }));
    rationale.appendChild(el("p", { text: data.schoolBased.embeddedRationale.intro }));
    const factors = el("ul", { class: "check-list" });
    data.schoolBased.embeddedRationale.factors.forEach((item) => factors.appendChild(el("li", { text: item })));
    rationale.appendChild(factors);
    wrap.appendChild(rationale);

    const direction = el("article", { class: "card" });
    direction.appendChild(el("h3", { text: "Current direction" }));
    data.schoolBased.currentDirection.forEach((item) => {
      direction.appendChild(el("p", { class: "member-area", text: item.title }));
      const points = el("ul", { class: "check-list" });
      item.points.forEach((point) => points.appendChild(el("li", { text: point })));
      direction.appendChild(points);
    });
    wrap.appendChild(direction);
  }

  function renderAhead() {
    $("#ahead-intro").textContent = data.lookingAhead.intro;
    listItems($("#ahead-points"), data.lookingAhead.points);
    $("#ahead-mentorship").textContent = data.lookingAhead.mentorship;
  }

  function renderContact() {
    const wrap = $("#contact-leaders");
    wrap.innerHTML = "";
    data.areas[0].members.slice(0, 3).forEach((member) => {
      const card = el("article", { class: "contact-card" });
      card.appendChild(
        el("img", {
          class: "contact-photo",
          attrs: { src: "assets/placeholder-headshot.jpg", alt: member.name },
        })
      );
      card.appendChild(el("h3", { text: member.name }));
      card.appendChild(el("p", { class: "member-role", text: member.role }));
      wrap.appendChild(card);
    });
  }

  function wireTeamSearch() {
    const input = $("#team-search");
    let timer;
    input.addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        activeQuery = input.value.trim();
        renderTeam();
      }, 100);
    });
  }

  function wireModal() {
    const modal = $("#member-modal");
    modal.addEventListener("click", (event) => {
      if (event.target.hasAttribute("data-close")) closeModal();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modal.hidden) closeModal();
    });
  }

  function observeReveals() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      $$(".reveal").forEach((node) => node.classList.add("in"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    $$(".reveal").forEach((node) => observer.observe(node));
  }

  function wireScrollSpy() {
    const nav = $("#jump-nav");
    const links = $$("a", nav);
    const byHref = new Map(links.map((link) => [link.getAttribute("href"), link]));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          if (!id) return;
          links.forEach((link) => link.classList.remove("active"));
          const active = byHref.get(`#${id}`);
          if (active) active.classList.add("active");
        });
      },
      { threshold: 0.55 }
    );

    $$('section[id]').forEach((section) => observer.observe(section));
  }

  function init() {
    renderHero();
    renderWho();
    renderImpact();
    renderSupport();
    renderAreas();
    renderFilters();
    renderTeam();
    renderSchools();
    renderAhead();
    renderContact();

    wireTeamSearch();
    wireModal();
    observeReveals();
    wireScrollSpy();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
