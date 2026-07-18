/* NAMAL CONSTRUCTIONS — shared interactions */
(function () {
  "use strict";

  /* Sticky header */
  const header = document.querySelector(".site-header");
  const backTop = document.querySelector(".back-top");
  const onScroll = () => {
    if (window.scrollY > 40) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
    if (backTop) backTop.classList.toggle("show", window.scrollY > 600);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile nav */
  const toggle = document.querySelector(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => document.body.classList.toggle("nav-open"));
    document.querySelectorAll(".nav a").forEach((a) =>
      a.addEventListener("click", () => document.body.classList.remove("nav-open"))
    );
  }

  /* Back to top */
  if (backTop) backTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* Scroll reveal */
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); } }),
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  /* Animated counters */
  const counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const dur = 1800, start = performance.now();
        const step = (now) => {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased).toLocaleString("en-IN");
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        cio.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach((c) => cio.observe(c));
  }

  /* Package accordions */
  document.querySelectorAll(".pkg-acc-head").forEach((btn) => {
    btn.addEventListener("click", () => {
      const acc = btn.parentElement;
      const body = acc.querySelector(".pkg-acc-body");
      const isOpen = acc.classList.contains("open");
      acc.parentElement.querySelectorAll(".pkg-acc.open").forEach((o) => {
        o.classList.remove("open");
        o.querySelector(".pkg-acc-body").style.maxHeight = null;
      });
      if (!isOpen) {
        acc.classList.add("open");
        body.style.maxHeight = body.scrollHeight + "px";
      }
    });
  });

  /* Project filters */
  const filterBtns = document.querySelectorAll(".filter-btn");
  if (filterBtns.length) {
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const f = btn.dataset.filter;
        document.querySelectorAll(".project-card").forEach((card) => {
          const show = f === "all" || card.dataset.cat === f;
          card.classList.toggle("hidden", !show);
        });
      });
    });
  }

  /* Testimonial slider */
  const slides = document.querySelector(".testi-slides");
  if (slides) {
    const count = slides.children.length;
    const dotsWrap = document.querySelector(".testi-dots");
    let idx = 0, timer;
    for (let i = 0; i < count; i++) {
      const d = document.createElement("button");
      d.setAttribute("aria-label", "Testimonial " + (i + 1));
      d.addEventListener("click", () => go(i, true));
      dotsWrap.appendChild(d);
    }
    const dots = dotsWrap.querySelectorAll("button");
    function go(i, manual) {
      idx = (i + count) % count;
      slides.style.transform = "translateX(-" + idx * 100 + "%)";
      dots.forEach((d, j) => d.classList.toggle("active", j === idx));
      if (manual) restart();
    }
    function restart() { clearInterval(timer); timer = setInterval(() => go(idx + 1), 6000); }
    go(0); restart();
  }

  /* ------- Contact form: validation + FormSubmit AJAX ------- */
  const form = document.getElementById("lead-form");
  if (form) {
    const status = document.getElementById("form-status");
    const setErr = (name, on, msg) => {
      const field = form.querySelector('[name="' + name + '"]').closest(".field");
      field.classList.toggle("error", on);
      if (msg) field.querySelector(".err-msg").textContent = msg;
    };
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      let ok = true;
      const v = (n) => form.querySelector('[name="' + n + '"]').value.trim();

      if (v("name").length < 2) { setErr("name", true, "Please enter your name."); ok = false; } else setErr("name", false);
      if (!/^[6-9]\d{9}$/.test(v("phone").replace(/[\s-]/g, ""))) { setErr("phone", true, "Enter a valid 10-digit mobile number."); ok = false; } else setErr("phone", false);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("email"))) { setErr("email", true, "Enter a valid email address."); ok = false; } else setErr("email", false);
      if (!v("project_type")) { setErr("project_type", true, "Select a project type."); ok = false; } else setErr("project_type", false);

      status.className = "form-status";
      if (!ok) return;

      const btn = form.querySelector('button[type="submit"]');
      const label = btn.textContent;
      btn.disabled = true; btn.textContent = "Sending…";

      try {
        const data = Object.fromEntries(new FormData(form).entries());
        const res = await fetch("https://formsubmit.co/ajax/admin@namalconstructions.com", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            _subject: "New enquiry — Namal Constructions website",
            _template: "table",
            Name: data.name, Phone: data.phone, Email: data.email,
            "Project type": data.project_type, "Budget range": data.budget || "Not specified",
            "Project location": data.location || "Not specified", Message: data.message || "—",
          }),
        });
        if (!res.ok) throw new Error("send failed");
        status.className = "form-status ok";
        status.textContent = "Thank you! Your enquiry has been received. Our team will call you back within one working day.";
        form.reset();
      } catch (err) {
        status.className = "form-status fail";
        status.innerHTML = 'Something went wrong sending your enquiry. Please call us directly at <a href="tel:+919884000646" style="color:inherit;text-decoration:underline">98840 00646</a>.';
      } finally {
        btn.disabled = false; btn.textContent = label;
        status.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }

  /* Footer year */
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
})();
