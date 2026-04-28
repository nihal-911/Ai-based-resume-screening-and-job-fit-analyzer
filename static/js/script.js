/* script.js — AI Resume Analyzer | Fixed Version */
"use strict";

/* ── UTIL (defined first so all code can use it) ────── */
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/* ── PARTICLES ───────────────────────────────────────── */
(function initParticles() {
  const container = document.getElementById("particles");
  if (!container) return;
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none";
  container.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  let W, H;
  const particles = [];
  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener("resize", resize);
  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * 1920, y: Math.random() * 1080,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5, o: Math.random() * 0.35 + 0.08
    });
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(139,92,246," + p.o + ")"; ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ── NAVBAR SCROLL ───────────────────────────────────── */
const navbar = document.getElementById("navbar");
if (navbar) {
  window.addEventListener("scroll", function() {
    navbar.classList.toggle("scrolled", window.scrollY > 30);
  });
}

/* ── PAGE DETECTION ─────────────────────────────────── */
const isResult    = document.body.classList.contains("result-page");
const isDashboard = document.body.classList.contains("dashboard-page");
const isIndex     = !isResult && !isDashboard;

/* ════════════════════════════════════════════════════════
   INDEX PAGE
════════════════════════════════════════════════════════ */
if (isIndex) {

  /* Skill Chips */
  var selectedSkills = [];
  var chips = document.querySelectorAll(".skill-chip");
  var scoreVal = document.getElementById("skillScoreValue");
  var skillBar = document.getElementById("skillBarFill");
  var skillHint = document.getElementById("skillHint");

  chips.forEach(function(chip) {
    chip.addEventListener("click", function() {
      var skill = chip.getAttribute("data-skill");
      if (chip.classList.contains("selected")) {
        chip.classList.remove("selected");
        selectedSkills = selectedSkills.filter(function(s) { return s !== skill; });
      } else {
        chip.classList.add("selected");
        selectedSkills.push(skill);
      }
      var score = Math.min(selectedSkills.length, 10);
      if (scoreVal) scoreVal.textContent = score;
      if (skillBar) skillBar.style.width = (score * 10) + "%";
      if (skillHint) {
        if (score === 0) skillHint.textContent = "Select skills to calculate your score";
        else if (score < 4) skillHint.textContent = "Keep going — select more skills!";
        else if (score < 7) skillHint.textContent = "Good start — try to add more!";
        else skillHint.textContent = "Excellent skill set!";
      }
      updateProgress();
    });
  });

  /* Sliders */
  function updateSliderBg(el, isGreen) {
    var v = parseFloat(el.value);
    var min = parseFloat(el.min);
    var max = parseFloat(el.max);
    var pct = ((v - min) / (max - min)) * 100;
    var color = isGreen ? "#10b981" : "#8b5cf6";
    el.style.background = "linear-gradient(to right," + color + " " + pct + "%,#1a1a24 " + pct + "%)";
  }

  function initSlider(id, displayId, isFloat, isGreen) {
    var el = document.getElementById(id);
    var disp = document.getElementById(displayId);
    if (!el || !disp) return;
    function update() {
      var v = parseFloat(el.value);
      disp.textContent = isFloat ? v.toFixed(1) : Math.round(v);
      updateSliderBg(el, isGreen);
      updateProgress();
    }
    el.addEventListener("input", update);
    update();
  }

  initSlider("cgpa",           "cgpaDisplay",    true,  false);
  initSlider("projects",       "projectsDisplay",false, false);
  initSlider("certifications", "certsDisplay",   false, false);
  initSlider("communication",  "commDisplay",    false, true);
  initSlider("aptitude",       "aptDisplay",     false, true);

  /* Progress Bar */
  var progressFill  = document.getElementById("progressFill");
  var progressLabel = document.getElementById("progressLabel");

  function updateProgress() {
    var score = 0;
    if (selectedSkills.length > 0) score += 20;
    var eduEl = document.getElementById("education");
    if (eduEl && eduEl.value) score += 20;
    var cgpaEl = document.getElementById("cgpa");
    if (cgpaEl && parseFloat(cgpaEl.value) > 5) score += 20;
    var commEl = document.getElementById("communication");
    if (commEl && parseInt(commEl.value) >= 5) score += 20;
    var domainChecked = document.querySelector('input[name="preferred_domain"]:checked');
    if (domainChecked) score += 20;
    if (progressFill)  progressFill.style.width = score + "%";
    if (progressLabel) progressLabel.textContent = score + "% complete";
  }

  var radioEls = document.querySelectorAll("input[name='preferred_domain'],input[name='english_fluency']");
  radioEls.forEach(function(el) { el.addEventListener("change", updateProgress); });
  updateProgress();

  /* File Upload */
  var uploadZone     = document.getElementById("uploadZone");
  var resumeFileEl   = document.getElementById("resumeFile");
  var uploadFilename = document.getElementById("uploadFilename");

  if (uploadZone && resumeFileEl) {
    /* Click anywhere in zone to open file picker */
    uploadZone.addEventListener("click", function(e) {
      if (e.target.tagName !== "LABEL" && e.target.tagName !== "INPUT") {
        resumeFileEl.click();
      }
    });
    uploadZone.addEventListener("dragover", function(e) {
      e.preventDefault();
      uploadZone.classList.add("drag-over");
    });
    uploadZone.addEventListener("dragleave", function() {
      uploadZone.classList.remove("drag-over");
    });
    uploadZone.addEventListener("drop", function(e) {
      e.preventDefault();
      uploadZone.classList.remove("drag-over");
      var file = e.dataTransfer.files[0];
      if (file) {
        if (uploadFilename) uploadFilename.textContent = "✅ " + file.name;
      }
    });
    resumeFileEl.addEventListener("change", function() {
      var file = resumeFileEl.files[0];
      if (file && uploadFilename) uploadFilename.textContent = "✅ " + file.name;
    });
  }

  /* Form Submit */
  var form        = document.getElementById("analyzeForm");
  var overlay     = document.getElementById("loadingOverlay");
  var loadingStep = document.getElementById("loadingStep");
  var steps = [
    "Preprocessing inputs…",
    "Running Naive Bayes classifier…",
    "Computing placement score…",
    "Identifying missing skills…",
    "Generating suggestions…",
    "Finalizing report…"
  ];

  if (form) {
    form.addEventListener("submit", function(e) {
      e.preventDefault();
      e.stopPropagation();

      if (selectedSkills.length === 0) {
        alert("Please select at least one technical skill from the list.");
        return;
      }

      var cgpaEl2   = document.getElementById("cgpa");
      var projEl    = document.getElementById("projects");
      var certsEl   = document.getElementById("certifications");
      var internEl  = document.getElementById("internships");
      var commEl2   = document.getElementById("communication");
      var aptEl     = document.getElementById("aptitude");
      var eduEl2    = document.getElementById("education");
      var fluencyEl = document.querySelector('input[name="english_fluency"]:checked');
      var domainEl  = document.querySelector('input[name="preferred_domain"]:checked');

      var payload = {
        skills:           selectedSkills,
        education:        eduEl2   ? eduEl2.value   : "UG",
        cgpa:             cgpaEl2  ? parseFloat(cgpaEl2.value)  : 7.0,
        projects:         projEl   ? parseInt(projEl.value)     : 0,
        certifications:   certsEl  ? parseInt(certsEl.value)    : 0,
        internships:      internEl ? internEl.value             : "No Internship",
        communication:    commEl2  ? parseInt(commEl2.value)    : 5,
        aptitude:         aptEl    ? parseInt(aptEl.value)      : 5,
        english_fluency:  fluencyEl ? fluencyEl.value           : "Average",
        preferred_domain: domainEl  ? domainEl.value            : "Software Developer"
      };

      /* Show loading overlay */
      if (overlay) overlay.removeAttribute("hidden");
      var si = 0;
      var intv = setInterval(function() {
        if (loadingStep && si < steps.length) {
          loadingStep.textContent = steps[si++];
        }
      }, 500);

      fetch("/api/analyze", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload)
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        clearInterval(intv);
        if (data.success) {
          sessionStorage.setItem("resumeResult", JSON.stringify(data.result));
          sessionStorage.setItem("resumeInputs", JSON.stringify(payload));
          window.location.href = "/result";
        } else {
          if (overlay) overlay.setAttribute("hidden", "");
          alert("Prediction error: " + (data.error || "Unknown"));
        }
      })
      .catch(function(err) {
        clearInterval(intv);
        if (overlay) overlay.setAttribute("hidden", "");
        alert("Network error: " + err.message);
      });
    });
  }
}

/* ════════════════════════════════════════════════════════
   RESULT PAGE
════════════════════════════════════════════════════════ */
if (isResult) {
  var noDataGuard   = document.getElementById("noDataGuard");
  var resultContent = document.getElementById("resultContent");
  var raw           = sessionStorage.getItem("resumeResult");
  var rawInput      = sessionStorage.getItem("resumeInputs");

  if (!raw) {
    if (noDataGuard)   noDataGuard.removeAttribute("hidden");
    if (resultContent) resultContent.style.display = "none";
  } else {
    var result = JSON.parse(raw);
    var inputs = rawInput ? JSON.parse(rawInput) : {};

    /* Job Fit Card */
    var jobFitCard = document.getElementById("jobFitCard");
    var jobFitVal  = document.getElementById("jobFitValue");
    var jobFitSub  = document.getElementById("jobFitSub");
    var jobFitIcon = document.getElementById("jobFitIcon");
    if (jobFitVal) {
      jobFitVal.textContent = result.job_fit || "—";
      if (result.job_fit === "Approved") {
        if (jobFitCard) jobFitCard.classList.add("approved");
        if (jobFitIcon) jobFitIcon.textContent = "✅";
        if (jobFitSub)  jobFitSub.textContent  = "Ready for Placement";
      } else {
        if (jobFitCard) jobFitCard.classList.add("needs");
        if (jobFitIcon) jobFitIcon.textContent = "⚠️";
        if (jobFitSub)  jobFitSub.textContent  = "Needs Improvement";
      }
    }

    /* Circular Arc Animation */
    function animateArc(arcId, pct, delay) {
      var arc = document.getElementById(arcId);
      if (!arc) return;
      var circ = 2 * Math.PI * 32; /* r=32 */
      setTimeout(function() {
        arc.style.strokeDashoffset = circ - (circ * pct / 100);
      }, delay);
    }

    var ps = result.placement_score || 0;
    setText("placementValue", ps + "%");
    animateArc("placementArc", ps, 400);

    var rs = result.resume_score || 0;
    setText("resumeScoreValue", rs + "%");
    animateArc("resumeArc", rs, 600);

    setText("roleValue",       result.recommended_role || "—");
    setText("domainMatchSub",  "Domain: " + (inputs.preferred_domain || "—"));
    setText("confidenceValue", (result.confidence || 0) + "%");

    /* Missing Skills */
    var missingList = document.getElementById("missingSkillsList");
    if (missingList) {
      if (result.missing_skills && result.missing_skills.length > 0) {
        missingList.innerHTML = result.missing_skills.map(function(s) {
          return '<span class="missing-skill-tag">⚡ ' + s + '</span>';
        }).join("");
      } else {
        missingList.innerHTML = '<span style="color:#10b981">✅ No critical missing skills!</span>';
      }
    }

    /* Suggestions */
    var suggList = document.getElementById("suggestionsList");
    if (suggList && result.suggestions && result.suggestions.length > 0) {
      suggList.innerHTML = result.suggestions.map(function(s, i) {
        return '<div class="suggestion-item"><div class="suggestion-num">' + (i + 1) + '</div><span>' + s + '</span></div>';
      }).join("");
    }

    /* Charts (Chart.js loaded via CDN in result.html) */
    if (window.Chart) {
      /* Radar Chart */
      var radarEl = document.getElementById("radarChart");
      if (radarEl) {
        new Chart(radarEl, {
          type: "radar",
          data: {
            labels: ["Skills", "CGPA", "Projects", "Certs", "Communication", "Aptitude"],
            datasets: [{
              label: "Your Profile",
              data: [
                Math.min((inputs.skills ? inputs.skills.length : 0) * 10, 100),
                ((parseFloat(inputs.cgpa || 7) - 5) / 5) * 100,
                Math.min((inputs.projects || 0) * 10, 100),
                Math.min((inputs.certifications || 0) * 10, 100),
                (inputs.communication || 5) * 10,
                (inputs.aptitude || 5) * 10
              ],
              borderColor: "#8b5cf6",
              backgroundColor: "rgba(139,92,246,0.15)",
              pointBackgroundColor: "#8b5cf6",
              pointRadius: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              r: {
                min: 0, max: 100,
                grid: { color: "#ffffff15" },
                ticks: { color: "#64748b", font: { size: 9 }, stepSize: 25 },
                pointLabels: { color: "#94a3b8", font: { size: 10 } }
              }
            },
            plugins: { legend: { labels: { color: "#94a3b8", font: { size: 10 } } } }
          }
        });
      }

      /* WEKA Comparison Bar */
      var wekaEl = document.getElementById("wekaChart");
      if (wekaEl) {
        new Chart(wekaEl, {
          type: "bar",
          data: {
            labels: ["Naive Bayes", "Random Forest", "J48 Tree", "ZeroR"],
            datasets: [{
              label: "Accuracy %",
              data: [87.3, 85.1, 83.6, 58.4],
              backgroundColor: ["rgba(139,92,246,.85)", "rgba(59,130,246,.75)", "rgba(16,185,129,.75)", "rgba(100,116,139,.5)"],
              borderColor: ["#8b5cf6", "#3b82f6", "#10b981", "#475569"],
              borderWidth: 1,
              borderRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: "y",
            scales: {
              x: { min: 50, max: 100, grid: { color: "#ffffff10" }, ticks: { color: "#94a3b8" } },
              y: { grid: { display: false }, ticks: { color: "#94a3b8", font: { size: 11 } } }
            },
            plugins: { legend: { display: false } }
          }
        });
      }
    }
  }
}

/* ════════════════════════════════════════════════════════
   DASHBOARD PAGE
════════════════════════════════════════════════════════ */
if (isDashboard) {
  var fitChart = null, rolesChart = null, domainsChart = null;

  function loadDashboard(seed) {
    var seedPromise = seed
      ? fetch("/api/seed-demo", { method: "POST" }).then(function() {})
      : Promise.resolve();

    seedPromise.then(function() {
      return fetch("/api/dashboard");
    }).then(function(res) {
      return res.json();
    }).then(function(d) {
      setText("statTotal",        d.total_users);
      setText("statApproved",     d.approved);
      setText("statNeeds",        d.needs_improvement);
      setText("statCGPA",         d.avg_cgpa || "—");
      setText("statApprovalRate", (d.approval_rate || 0) + "%");

      /* Table */
      var tbody = document.getElementById("submissionsBody");
      if (tbody) {
        if (!d.recent_submissions || d.recent_submissions.length === 0) {
          tbody.innerHTML = '<tr><td colspan="6" class="empty-row">No submissions yet — use the form or load demo data.</td></tr>';
        } else {
          tbody.innerHTML = d.recent_submissions.map(function(s, i) {
            var badgeCls = s.job_fit === "Approved" ? "approved" : "needs";
            return "<tr><td>" + (i + 1) + "</td><td>" + s.timestamp + "</td><td>" + s.cgpa + "</td><td>" + s.skills_count + "</td><td><span class='fit-badge " + badgeCls + "'>" + s.job_fit + "</span></td><td>" + s.role + "</td></tr>";
          }).join("");
        }
      }

      if (!window.Chart) return;

      /* Doughnut */
      var fitEl = document.getElementById("fitDoughnut");
      if (fitEl) {
        if (fitChart) fitChart.destroy();
        fitChart = new Chart(fitEl, {
          type: "doughnut",
          data: {
            labels: ["Approved", "Needs Improvement"],
            datasets: [{
              data: [d.approved || 0, d.needs_improvement || 0],
              backgroundColor: ["rgba(16,185,129,.85)", "rgba(245,158,11,.85)"],
              borderColor: ["#10b981", "#f59e0b"],
              borderWidth: 2,
              hoverOffset: 8
            }]
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: "bottom", labels: { color: "#94a3b8", font: { size: 11 }, padding: 12 } } }
          }
        });
      }

      /* Roles Bar */
      var rolesEl = document.getElementById("rolesBar");
      if (rolesEl && d.top_roles && d.top_roles.length) {
        if (rolesChart) rolesChart.destroy();
        rolesChart = new Chart(rolesEl, {
          type: "bar",
          data: {
            labels: d.top_roles.map(function(r) { return r[0]; }),
            datasets: [{
              label: "Count",
              data: d.top_roles.map(function(r) { return r[1]; }),
              backgroundColor: "rgba(139,92,246,.75)",
              borderColor: "#8b5cf6",
              borderWidth: 1,
              borderRadius: 6
            }]
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
              x: { grid: { display: false }, ticks: { color: "#94a3b8", font: { size: 10 } } },
              y: { grid: { color: "#ffffff10" }, ticks: { color: "#94a3b8" } }
            },
            plugins: { legend: { display: false } }
          }
        });
      }

      /* Domains Bar */
      var domEl = document.getElementById("domainsBar");
      if (domEl && d.top_domains && d.top_domains.length) {
        if (domainsChart) domainsChart.destroy();
        domainsChart = new Chart(domEl, {
          type: "bar",
          data: {
            labels: d.top_domains.map(function(r) { return r[0]; }),
            datasets: [{
              label: "Submissions",
              data: d.top_domains.map(function(r) { return r[1]; }),
              backgroundColor: "rgba(59,130,246,.75)",
              borderColor: "#3b82f6",
              borderWidth: 1,
              borderRadius: 6
            }]
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
              x: { grid: { display: false }, ticks: { color: "#94a3b8", font: { size: 10 } } },
              y: { grid: { color: "#ffffff10" }, ticks: { color: "#94a3b8" } }
            },
            plugins: { legend: { display: false } }
          }
        });
      }

    }).catch(function(err) { console.error("Dashboard error:", err); });
  }

  var seedBtn = document.getElementById("seedBtn");
  if (seedBtn) {
    seedBtn.addEventListener("click", function() { loadDashboard(true); });
  }

  loadDashboard(false);
}
