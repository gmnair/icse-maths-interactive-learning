(function () {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const formatMoney = (value) => new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(value);

  const topicSearch = $("#topic-search");
  topicSearch.addEventListener("input", () => {
    const query = topicSearch.value.trim().toLowerCase();
    let visible = 0;
    document.querySelectorAll(".topic-card").forEach((card) => {
      const match = !query || (card.dataset.search + " " + card.textContent).toLowerCase().includes(query);
      card.hidden = !match;
      if (match) visible += 1;
    });
    $("#no-results").hidden = visible !== 0;
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
      event.preventDefault();
      topicSearch.focus();
    }
  });

  const gstInputs = ["#gst-price", "#gst-rate", "#gst-type"].map((selector) => $(selector));
  const updateGst = () => {
    const price = Number(gstInputs[0].value);
    const rate = Number(gstInputs[1].value);
    if (!Number.isFinite(price) || price < 0) {
      $("#gst-result").textContent = "Enter a valid non-negative price.";
      return;
    }
    const tax = price * rate / 100;
    const split = gstInputs[2].value === "intra"
      ? `CGST ${formatMoney(tax / 2)} + SGST ${formatMoney(tax / 2)}`
      : `IGST ${formatMoney(tax)}`;
    $("#gst-result").innerHTML = `${split}<br>Total payable: <strong>₹${formatMoney(price + tax)}</strong>`;
  };
  gstInputs.forEach((input) => input.addEventListener("input", updateGst));
  updateGst();

  $("#solve-quad").addEventListener("click", () => {
    const a = Number($("#quad-a").value);
    const b = Number($("#quad-b").value);
    const c = Number($("#quad-c").value);
    const result = $("#quad-result");
    if (![a, b, c].every(Number.isFinite) || a === 0) {
      result.textContent = "Enter valid coefficients, with a not equal to 0.";
      return;
    }
    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) {
      result.textContent = `Discriminant = ${discriminant}. There are no real roots.`;
      return;
    }
    const root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    const root2 = (-b - Math.sqrt(discriminant)) / (2 * a);
    const rounded = (value) => Number(value.toFixed(4));
    result.innerHTML = `Discriminant = ${discriminant}.<br>Roots: <strong>${rounded(root1)}</strong>${root1 === root2 ? "" : ` and <strong>${rounded(root2)}</strong>`}`;
  });

  const solidType = $("#solid-type");
  const solidHeightField = $("#height-field");
  const updateSolid = () => {
    const radius = Number($("#solid-r").value);
    const height = Number($("#solid-h").value);
    const type = solidType.value;
    solidHeightField.hidden = type === "sphere" || type === "hemisphere";
    if (!Number.isFinite(radius) || radius < 0 || (!solidHeightField.hidden && (!Number.isFinite(height) || height < 0))) {
      $("#solid-result").textContent = "Enter valid non-negative dimensions.";
      return;
    }
    let volume;
    if (type === "cylinder") volume = Math.PI * radius * radius * height;
    else if (type === "cone") volume = Math.PI * radius * radius * height / 3;
    else if (type === "sphere") volume = 4 * Math.PI * radius ** 3 / 3;
    else volume = 2 * Math.PI * radius ** 3 / 3;
    $("#solid-result").innerHTML = `Volume = <strong>${volume.toFixed(2)} cubic units</strong> (using π ≈ 3.14159)`;
  };
  [solidType, $("#solid-r"), $("#solid-h")].forEach((input) => input.addEventListener("input", updateSolid));
  solidType.addEventListener("change", updateSolid);
  updateSolid();

  const angleSlider = $("#angle-slider");
  const distanceInput = $("#trig-distance");
  const angleOutput = $("#angle-output");
  let trigBoard;
  let trigPoints;
  let trigLabels;
  const updateTriangle = () => {
    const angle = Number(angleSlider.value);
    const distance = Number(distanceInput.value);
    angleOutput.value = `${angle}°`;
    angleOutput.textContent = `${angle}°`;
    if (!Number.isFinite(distance) || distance <= 0) {
      $("#trig-result").textContent = "Enter a ground distance greater than zero.";
      return;
    }
    const height = distance * Math.tan(angle * Math.PI / 180);
    $("#trig-result").innerHTML = `Height = distance × tan(${angle}°) = <strong>${height.toFixed(2)} m</strong>`;
    if (trigBoard && trigPoints) {
      const scale = 5 / Math.max(distance, height);
      const ground = distance * scale;
      const rise = height * scale;
      trigBoard.suspendUpdate();
      trigPoints.foot.setPosition(JXG.COORDS_BY_USER, [ground, 0]);
      trigPoints.apex.setPosition(JXG.COORDS_BY_USER, [ground, rise]);
      trigLabels.ground.setText(`${distance} m`);
      trigLabels.height.setText(`${height.toFixed(1)} m`);
      trigLabels.angle.setText(`${angle}°`);
      trigLabels.ground.setPosition(JXG.COORDS_BY_USER, [ground * 0.38, -0.42]);
      trigLabels.height.setPosition(JXG.COORDS_BY_USER, [ground + 0.15, rise * 0.5]);
      trigLabels.angle.setPosition(JXG.COORDS_BY_USER, [0.55, Math.min(0.65, rise * 0.18)]);
      trigBoard.unsuspendUpdate();
    }
  };
  if (window.JXG) {
    trigBoard = JXG.JSXGraph.initBoard("trig-board", {
      boundingbox: [-0.7, 7.7, 7.2, -0.8], axis: false, showNavigation: false, showCopyright: false,
      pan: { enabled: false }, zoom: { enabled: false }
    });
    const origin = trigBoard.create("point", [0, 0], { name: "", fixed: true, visible: false });
    const foot = trigBoard.create("point", [4, 0], { name: "", fixed: true, visible: false });
    const apex = trigBoard.create("point", [4, 3], { name: "", fixed: true, visible: false });
    trigBoard.create("segment", [origin, foot], { strokeColor: "#c5d5cf", strokeWidth: 2, fixed: true });
    trigBoard.create("segment", [foot, apex], { strokeColor: "#38a789", strokeWidth: 3, fixed: true });
    trigBoard.create("segment", [origin, apex], { strokeColor: "#b4c9c1", strokeWidth: 2, dash: 2, fixed: true });
    trigLabels = {
      ground: trigBoard.create("text", [1.5, -0.42, "40 m"], { fixed: true, fontSize: 10, strokeColor: "#657b75" }),
      height: trigBoard.create("text", [4.15, 1.5, "28.0 m"], { fixed: true, fontSize: 10, strokeColor: "#21846c" }),
      angle: trigBoard.create("text", [0.55, 0.5, "35°"], { fixed: true, fontSize: 10, strokeColor: "#b47d24" })
    };
    trigPoints = { foot, apex };
  } else {
    $("#trig-board").hidden = true;
    const note = document.createElement("p");
    note.className = "small-copy";
    note.textContent = "The live diagram needs JSXGraph to load. Use the height calculation below.";
    $("#trig-board").after(note);
  }
  [angleSlider, distanceInput].forEach((input) => input.addEventListener("input", updateTriangle));
  updateTriangle();

  let statisticsChart;
  const statsCanvas = $("#statistics-chart");
  const updateStatistics = () => {
    const frequencies = Array.from(document.querySelectorAll(".freq-value"), (input) => Math.max(0, Number(input.value) || 0));
    const labels = ["0–10", "10–20", "20–30", "30–40", "40–50"];
    const total = frequencies.reduce((sum, value) => sum + value, 0);
    const weighted = frequencies.reduce((sum, value, index) => sum + value * (5 + index * 10), 0);
    $("#statistics-result").innerHTML = total ? `Total frequency: <strong>${total}</strong> · Grouped mean: <strong>${(weighted / total).toFixed(2)}</strong>` : "Add a frequency greater than zero to find the mean.";
    if (window.Chart) {
      if (statisticsChart) {
        statisticsChart.data.datasets[0].data = frequencies;
        statisticsChart.update();
      } else {
        statisticsChart = new Chart(statsCanvas, {
          type: "bar",
          data: { labels, datasets: [{ label: "Frequency", data: frequencies, backgroundColor: "#64bea2", borderRadius: 4, maxBarThickness: 38 }] },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true, ticks: { precision: 0 } } } }
        });
      }
    }
  };
  document.querySelectorAll(".freq-value").forEach((input) => input.addEventListener("input", updateStatistics));
  updateStatistics();

  let probabilityChart;
  $("#run-probability").addEventListener("click", () => {
    const counts = [Number($("#count-mint").value), Number($("#count-coral").value), Number($("#count-blue").value)];
    const draws = Number($("#draw-count").value);
    const result = $("#probability-result");
    if (counts.some((value) => !Number.isInteger(value) || value < 0) || counts.every((value) => value === 0) || !Number.isInteger(draws) || draws < 1 || draws > 1000) {
      result.textContent = "Use non-negative whole-number counter counts (at least one in total) and 1–1,000 draws.";
      return;
    }
    const total = counts.reduce((sum, value) => sum + value, 0);
    const outcomes = counts.map(() => 0);
    for (let draw = 0; draw < draws; draw += 1) {
      let pick = Math.random() * total;
      let color = 0;
      while (pick >= counts[color]) {
        pick -= counts[color];
        color += 1;
      }
      outcomes[color] += 1;
    }
    const theoretical = counts.map((value) => value / total * 100);
    const experimental = outcomes.map((value) => value / draws * 100);
    const names = ["Mint", "Coral", "Blue"];
    result.innerHTML = `Theoretical chance: ${theoretical.map((value, index) => `${names[index]} ${value.toFixed(1)}%`).join(" · ")}<br>Observed in ${draws} draws: ${experimental.map((value, index) => `${names[index]} ${value.toFixed(1)}%`).join(" · ")}`;
    if (window.Chart) {
      if (probabilityChart) {
        probabilityChart.data.datasets[0].data = theoretical;
        probabilityChart.data.datasets[1].data = experimental;
        probabilityChart.update();
      } else {
        probabilityChart = new Chart($("#probability-chart"), {
          type: "bar",
          data: {
            labels: names,
            datasets: [
              { label: "Theoretical %", data: theoretical, backgroundColor: "#91b8d3", borderRadius: 4 },
              { label: "Observed %", data: experimental, backgroundColor: "#eaa485", borderRadius: 4 }
            ]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 9 } } } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true, max: 100, ticks: { callback: (value) => `${value}%` } } } }
        });
      }
    }
  });
})();
