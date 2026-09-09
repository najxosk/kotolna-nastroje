(function () {
  const status = document.getElementById("status");
  const metrics = document.getElementById("metrics");
  const table = document.getElementById("table");
  const preview = document.getElementById("preview");
  const ocrBox = document.getElementById("ocrBox");
  const ocrText = document.getElementById("ocrText");
  const setStatus = (t) => { status.textContent = t; };

  function splitCsvLine(line) {
    const out = []; let cur = ""; let q = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (q) {
        if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (c === '"') q = false; else cur += c;
      } else {
        if (c === '"') q = true;
        else if (c === ',' || c === '\t') { out.push(cur); cur = ""; }
        else cur += c;
      }
    }
    out.push(cur); return out;
  }

  function rowsFromCsvText(text) {
    const lines = text.replace(/^\uFEFF/, "").trim().split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) throw new Error("Malo riadkov");
    let hi = 0;
    for (let i = 0; i < Math.min(lines.length, 8); i++) {
      if (/timestamp|gas|load|steam|feedwater|cas|plyn/i.test(lines[i])) { hi = i; break; }
    }
    const headers = splitCsvLine(lines[hi]).map((h) => h.trim());
    return lines.slice(hi + 1).map((l) => {
      const c = splitCsvLine(l); const o = {};
      headers.forEach((h, i) => { o[h] = (c[i] || "").trim(); });
      return o;
    }).filter((r) => Object.values(r).some((v) => v));
  }

  function normalizeRows(raw) {
    const alias = {
      timestamp: ["timestamp", "time", "cas", "datum", "date"],
      gas_nm3: ["gas_nm3", "gas", "plyn", "plyn_nm3"],
      air_flow: ["air_flow", "air", "vzduch"],
      feedwater_th: ["feedwater_th", "feedwater", "napajacia_voda", "feedwater_t", "nv_th"],
      steam_th: ["steam_th", "steam", "para", "steam_t", "para_th"],
      load_mw: ["load_mw", "load", "vykon", "power_mw", "mw"],
      flue_o2_pct: ["flue_o2_pct", "o2", "o2_pct", "kyslik"],
      running: ["running", "beh", "run"]
    };
    function pick(row, keys) {
      const map = {};
      Object.keys(row).forEach((k) => { map[k.toLowerCase().trim()] = row[k]; });
      for (const k of keys) { if (map[k] != null && map[k] !== "") return map[k]; }
      return "";
    }
    return raw.map((r) => {
      const o = {};
      for (const [canon, keys] of Object.entries(alias)) o[canon] = pick(r, keys);
      return o;
    }).filter((r) => r.timestamp || r.gas_nm3 || r.load_mw);
  }

  function analyze(rows) {
    rows = normalizeRows(rows);
    if (!rows.length) { setStatus("Nenasli sa pouzitelne stlpce"); return; }
    const num = (r, k) => parseFloat(String(r[k]).replace(",", "."));
    const loads = rows.map((r) => num(r, "load_mw")).filter((x) => !isNaN(x));
    const medLoad = [...loads].sort((a, b) => a - b)[Math.floor(loads.length / 2)] || 0;
    const minLoad = Math.max(medLoad * 0.4, 0.5);
    const ratios = rows.map((r) => {
      const load = num(r, "load_mw"), gas = num(r, "gas_nm3"), air = num(r, "air_flow");
      const steam = num(r, "steam_th"), feed = num(r, "feedwater_th");
      const running = r.running !== "" ? Number(r.running) === 1 : load >= minLoad;
      return {
        t: r.timestamp, load, running,
        gas_per_mw: load > 0.05 ? gas / load : NaN,
        air_per_gas: gas > 0 ? air / gas : NaN,
        steam_per_feed: feed > 0 ? steam / feed : NaN,
        o2: num(r, "flue_o2_pct"),
        in_stats: running && load >= minLoad
      };
    });
    const stats = ratios.filter((r) => r.in_stats && !isNaN(r.gas_per_mw));
    const avg = (arr, k) => { const v = arr.map((r) => r[k]).filter((x) => !isNaN(x)); return v.length ? v.reduce((s, x) => s + x, 0) / v.length : NaN; };
    const med = (arr, k) => { const v = arr.map((r) => r[k]).filter((x) => !isNaN(x)).sort((a, b) => a - b); return v.length ? v[Math.floor(v.length / 2)] : NaN; };
    const medGas = med(stats, "gas_per_mw");
    const fmt = (x, d) => { d = d == null ? 2 : d; return isNaN(x) ? "-" : x.toFixed(d); };
    metrics.innerHTML = [
      ["O plyn/MW (beh)", fmt(avg(stats, "gas_per_mw"), 1)],
      ["O vzduch/plyn", fmt(avg(stats, "air_per_gas"), 2)],
      ["O para/voda t/h", fmt(avg(stats, "steam_per_feed"), 3)],
      ["O O2 %", fmt(avg(stats, "o2"), 2)],
      ["Hodin v statistike", String(stats.length)]
    ].map(function (pair) { return '<div class="metric">' + pair[0] + "<b>" + pair[1] + "</b></div>"; }).join("");
    var html = '<p class="note">Statistiky len beh. Flag nad medianom merneho plynu = priklad.</p>';
    html += "<table><tr><th>cas</th><th>load</th><th>beh</th><th>plyn/MW</th><th>vzduch/plyn</th><th>para/voda</th><th>O2</th><th>flag</th></tr>";
    ratios.slice(-36).forEach(function (r) {
      var flag = (r.in_stats && !isNaN(r.gas_per_mw) && !isNaN(medGas) && r.gas_per_mw > medGas * 1.08) ? "vysoka merna*" : "";
      html += "<tr><td>" + (r.t || "") + "</td><td>" + fmt(r.load) + "</td><td>" + (r.in_stats ? "ano" : "nie") + "</td><td>" + fmt(r.gas_per_mw, 1) + "</td><td>" + fmt(r.air_per_gas) + "</td><td>" + fmt(r.steam_per_feed, 3) + "</td><td>" + fmt(r.o2) + "</td><td>" + flag + "</td></tr>";
    });
    html += "</table>";
    table.innerHTML = html;
    setStatus("Hotovo · " + rows.length + " riadkov");
  }

  async function fromExcel(file) {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    analyze(XLSX.utils.sheet_to_json(sheet, { defval: "" }));
  }

  async function fromDocx(file) {
    const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    ocrBox.hidden = false;
    ocrText.value = result.value;
    setStatus("Word text vytiahnuty — uprav a Spracovat text (CSV riadky)");
  }

  async function fromImage(file) {
    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";
    ocrBox.hidden = false;
    setStatus("OCR…");
    if (!window.Tesseract) {
      setStatus("OCR kniznica nie je nacitana (net). Vloz text z obrazka rucne do pola.");
      return;
    }
    try {
      const res = await window.Tesseract.recognize(file, "eng", {
        logger: function (m) {
          if (m.status === "recognizing text") setStatus("OCR " + Math.round((m.progress || 0) * 100) + "%");
        }
      });
      ocrText.value = res.data.text;
      setStatus("OCR hotove — skontroluj cisla a Spracovat text");
    } catch (e) {
      setStatus("OCR zlyhalo: " + e.message + ". Vloz text rucne.");
    }
  }

  document.getElementById("file").addEventListener("change", async function (e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    preview.style.display = "none";
    ocrBox.hidden = true;
    metrics.innerHTML = "";
    table.innerHTML = "";
    const name = f.name.toLowerCase();
    try {
      if (name.endsWith(".csv") || f.type === "text/csv") {
        setStatus("CSV…"); analyze(rowsFromCsvText(await f.text()));
      } else if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
        setStatus("Excel…"); await fromExcel(f);
      } else if (name.endsWith(".docx")) {
        setStatus("Word…"); await fromDocx(f);
      } else if ((f.type && f.type.indexOf("image/") === 0) || /\.(png|jpe?g|webp)$/i.test(name)) {
        await fromImage(f);
      } else setStatus("Nepodporovany format");
    } catch (err) { setStatus("Chyba: " + err.message); }
  });

  document.getElementById("btnParseText").addEventListener("click", function () {
    try {
      const t = ocrText.value.trim();
      if (t.indexOf(",") >= 0 || t.indexOf("\t") >= 0) analyze(rowsFromCsvText(t));
      else setStatus("Vloz data ako CSV (ciarky)");
    } catch (err) { setStatus("Chyba: " + err.message); }
  });
})();
