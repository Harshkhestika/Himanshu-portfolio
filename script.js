// script.js

/* ---------------------------
   Modern Portfolio Interactions
   - Mobile menu
   - Active section highlight
   - Scroll reveal (IntersectionObserver)
   - Smooth anchor behavior fallback
   - Animation consent logic (confirm)
---------------------------- */

(() => {
  const $ = (q, root = document) => root.querySelector(q);
  const $$ = (q, root = document) => Array.from(root.querySelectorAll(q));

  // Footer year
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Mobile menu toggle
  const menuBtn = $("#menuBtn");
  const mobileMenu = $("#mobileMenu");
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });

    // Close menu after clicking a link

    $$(".nav-link", mobileMenu).forEach((a) => {
      a.addEventListener("click", () => mobileMenu.classList.add("hidden"));
    });
  }

  // Active section highlighting
  const navLinks = $$(".nav-link");
  const sections = ["home", "about", "skills", "projects", "certificates", "education", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  function setActiveLink(activeId) {
    navLinks.forEach((a) => {
      const href = a.getAttribute("href") || "";
      const isActive = href === `#${activeId}`;
      a.classList.toggle("active", isActive);
    });
  }

  // Scroll reveal observer (initialized later after consent)
  let revealObserver = null;
  let sectionObserver = null;

  function initRevealAnimations() {
    const revealEls = $$(".reveal");

    // Reveal observer
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -10% 0px" }
    );

    revealEls.forEach((el) => revealObserver.observe(el));

    // Section observer for nav active state
    sectionObserver = new IntersectionObserver(
      (entries) => {
        // Pick the most visible intersecting section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];

        if (visible && visible.target && visible.target.id) {
          setActiveLink(visible.target.id);
        }
      },
      { threshold: [0.2, 0.35, 0.5, 0.7], rootMargin: "-15% 0px -60% 0px" }
    );

    sections.forEach((sec) => sectionObserver.observe(sec));
  }

  function disableAnimations() {
    document.body.classList.add("anim-off");

    // Make all reveal elements visible immediately

    $$(".reveal").forEach((el) => {
      el.classList.add("is-visible");
      el.style.opacity = "1";
      el.style.transform = "none";
    });

    // Disconnect observers if any
    if (revealObserver) revealObserver.disconnect();
    if (sectionObserver) sectionObserver.disconnect();

    // Still highlight nav based on scroll without animations
    // Simple scroll-based active state fallback:
    window.addEventListener(
      "scroll",
      () => {
        let current = "home";
        const y = window.scrollY + 120;

        sections.forEach((sec) => {
          if (sec.offsetTop <= y) current = sec.id;
        });

        setActiveLink(current);
      },
      { passive: true }
    );
  }

  // Smooth anchor fallback: ensure focus + close menu
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href^='#']");
    if (!a) return;
    const id = a.getAttribute("href").slice(1);
    const target = document.getElementById(id);
    if (!target) return;

    // Let browser handle smooth scroll (CSS). Ensure focus after scroll.
    setTimeout(() => target.setAttribute("tabindex", "-1"), 0);
    setTimeout(() => target.focus({ preventScroll: true }), 350);
  });

  // Default active state
  setActiveLink("home");

  /* -----------------------------------------
     USER ANIMATION CONSENT (SPECIAL REQUIREMENT)
     Ask user confirmation using confirm()
     If yes -> animations active
     If no  -> animations disabled via flag
     (Placed at end of file as required.)
  ------------------------------------------ */

  const userConsentsToAnimations = confirm(
    "Enable subtle animations (scroll reveal, hover lifts, floating background)?"
  );

  if (userConsentsToAnimations) {
    initRevealAnimations();
  } else {
    disableAnimations();
  }
})();