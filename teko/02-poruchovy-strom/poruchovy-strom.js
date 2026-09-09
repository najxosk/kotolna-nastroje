
(function () {
  const STORE = "poruchovy-strom-v3";
  const $ = (id) => document.getElementById(id);
  const menu = $("menu"), tree = $("tree"), crumb = $("crumb");
  const btnBack = $("btnBack"), btnReset = $("btnReset");
  const modeWalk = $("modeWalk"), modeEdit = $("modeEdit"), editBar = $("editBar");
  const dlg = $("dlg"), dlgTitle = $("dlgTitle"), dlgBody = $("dlgBody");

function demoTrees() {
    return {
      flame: {
        title: "1 · Strata plamena",
        start: "s1",
        nodes: {
          s1: { kind: "q", text: "Je privod plynu otvoreny a tlak v norme?", yes: "s2", no: "e_gas" },
          s2: { kind: "q", text: "Bezi vzduch / ventilator v poriadku?", yes: "s3", no: "e_fan" },
          s3: { kind: "q", text: "Dovoluje predpis restart a mas opravnenie?", yes: "s4", no: "e_call" },
          s4: { kind: "q", text: "Po jednom pokuse restartu plamen drzi?", yes: "e_ok", no: "e_repeat" },
          e_gas: { kind: "end", text: "Skontroluj privod/tlak plynu podla predpisu.

Do dennika: cas, tlak, stav armatur.

(Potencial: napojenie na konkretne cisla z vaseho panelu.)" },
          e_fan: { kind: "end", text: "Skontroluj vzduchovu cestu / ventilator podla predpisu.

Do dennika: stav ventilatora, klapky." },
          e_call: { kind: "end", text: "Bez opravnenia / stale zle -> majster alebo pohotovost.

Do dennika: co si skontroloval." },
          e_ok: { kind: "end", text: "Plamen drzi — sleduj parametre 10–15 min.

Do dennika: cas vypadku, cas obnovy, pocet restartov = 1." },
          e_repeat: { kind: "end", text: "Opakovany vypadok — neopakuj donekonecna. Volaj.

Do dennika: pocet pokusov, symptomy." }
        }
      },
      pressure_low: {
        title: "2 · Nizky tlak pary",
        start: "s1",
        nodes: {
          s1: { kind: "q", text: "Je odber pary nahle vyssi (spicka v sieti)?", yes: "e_load", no: "s2" },
          s2: { kind: "q", text: "Horak bezi na ocakavanom vykone?", yes: "s3", no: "e_fuel" },
          s3: { kind: "q", text: "Je viditelny unik / odvzdusnenie / poistka v akcii?", yes: "e_leak", no: "e_sensor" },
          e_load: { kind: "end", text: "Mozna spicka odberu. Sleduj vykon, komunikuj s odberom.

Do dennika: tlak, odber ak vies.

(Potencial: graf tlaku vs. odber z hodinych dat.)" },
          e_fuel: { kind: "end", text: "Over palivo a regulaciu horaka.

Do dennika: vykon %, tlak, palivo." },
          e_leak: { kind: "end", text: "Over miesta uniku / poistky podla predpisu.

Do dennika: kde si pozeral." },
          e_sensor: { kind: "end", text: "Mozny problem merania alebo pomaly nabiehajuci vykon.

Do dennika: porovnanie ukazovatelov tlaku." }
        }
      },
      drum: {
        title: "3 · Vysoka hladina v bubne",
        start: "s1",
        nodes: {
          s1: { kind: "q", text: "Sedia vsetky ukazovatele hladiny navzajom?", yes: "s2", no: "e_sensor" },
          s2: { kind: "q", text: "Je napajanie / ventil v rozumnej polohe?", yes: "s3", no: "e_valve" },
          s3: { kind: "q", text: "Je odber pary velmi nizky oproti napajaniu?", yes: "e_balance", no: "e_limit" },
          e_sensor: { kind: "end", text: "Mozny chybny snimac / meranie.

Do dennika: ktore ukazovatele nesedia." },
          e_valve: { kind: "end", text: "Ries napajanie podla predpisu — bez improvizacie mimo opravneni.

Do dennika: poloha ventila / prietok." },
          e_balance: { kind: "end", text: "Nepomer napajanie vs. odber — uprav podla predpisu / regulacie.

Do dennika: hladina, napajanie, odber." },
          e_limit: { kind: "end", text: "Pri limitoch konaj podla havarijneho postupu / volaj.

Do dennika: cas, hladina, co si spravil.

(Potencial: fotka panelu + checklist z MPPP.)" }
        }
      },
      fan: {
        title: "4 · Vypadok vzduchoveho ventilatora",
        start: "s1",
        nodes: {
          s1: { kind: "q", text: "Vypadol jeden ventilator, alebo oba?", yes: "s2", no: "s3" },
          s2: { kind: "q", text: "Druhy ventilator bezi a tlak vzduchu staci?", yes: "e_one", no: "e_both" },
          s3: { kind: "q", text: "Je to elektrina / istič / frekvencny menic?", yes: "e_elec", no: "e_mech" },
          e_one: { kind: "end", text: "Jeden ventilator: uprav vykon podla predpisu, sleduj blokady.

Do dennika: ktory ventilator, vykon, tlak vzduchu.

(Potencial: strom naviazany na vase konkretne blokady.)" },
          e_both: { kind: "end", text: "Oba / nedostatocny vzduch: typicky odstavenie spaľovania podla ochran.

Do dennika: cas, stav oboch, co spustilo ochranu." },
          e_elec: { kind: "end", text: "Elektrina / menic — podla predpisu, bez zasahu mimo opravneni.

Do dennika: istič, alarm menica, kto bol privolany." },
          e_mech: { kind: "end", text: "Mozna mechanika (hluk, vibracie, klapky).

Do dennika: co pocujes/vidis, teplota, vibracie." }
        }
      },
      water: {
        title: "5 · Podozrenie na chemicky rezim / odkal",
        start: "s1",
        nodes: {
          s1: { kind: "q", text: "Je kotol v behu viac ako ~4 tyzdne bez odkalenia?", yes: "e_blow", no: "s2" },
          s2: { kind: "q", text: "Mas cerstvo vysledok akosti vody mimo limitu?", yes: "e_chem", no: "s3" },
          s3: { kind: "q", text: "Je podozrenie na zanesenie / nestabilnu hladinu?", yes: "e_foul", no: "e_watch" },
          e_blow: { kind: "end", text: "Zvaz odkal podla predpisu (aj za behu len v dovolenych podmienkach).

Do dennika: posledne odkalenie, vykon pri odkale.

(Potencial: pripomienka z dennika + chemicke cisla z labaky.)" },
          e_chem: { kind: "end", text: "Chemicky rezim mimo limitu — postup podla predpisu / chemika.

Do dennika: namerane hodnoty, davkovanie, kto rozhodol." },
          e_foul: { kind: "end", text: "Nestabilna hladina / podozrenie na zanesenie — nespekuluj; zapis a eskaluj.

Do dennika: symptomy, tlak, hladina." },
          e_watch: { kind: "end", text: "Zatial len sleduj a zapis trend.

Do dennika: preco si to riesil, co bolo v norme." }
        }
      },
      trip: {
        title: "6 · Nudzove / okamzite odstavenie (ukazka)",
        start: "s1",
        nodes: {
          s1: { kind: "q", text: "Ide o aktivaciu ochrany / nudzove tlacidlo?", yes: "s2", no: "s3" },
          s2: { kind: "q", text: "Vies z panelu ktora ochrana / signal to spustil?", yes: "e_known", no: "e_unknown" },
          s3: { kind: "q", text: "Je ohrozena bezpecnost osob / okolia?", yes: "e_safe", no: "e_plan" },
          e_known: { kind: "end", text: "Zapis presny signal/ochranu, cas, stav kotla.

Dalsi krok: podla predpisu + majster.

(Potencial: 1 klik = predvyplneny riadok do dennika Excel.)" },
          e_unknown: { kind: "end", text: "Signal nejasny — neexperimentuj. Zabezpec stav, volaj.

Do dennika: co svietilo, co si stlacil, cas." },
          e_safe: { kind: "end", text: "Bezpecnost first — odstavenie / evakuacne postupy podla predpisu.

Do dennika az ked je bezpecne." },
          e_plan: { kind: "end", text: "Ak nie je okamzity ohroz — planovane odstavenie / tepla zaloha podla typu.

Do dennika: dovod, typ odstavenia." }
        }
      }
    };
  }


  function loadTrees() {
    try {
      const raw = localStorage.getItem(STORE);
      if (!raw) return demoTrees();
      const data = JSON.parse(raw);
      return (data && data.trees) ? data.trees : demoTrees();
    } catch (e) { return demoTrees(); }
  }
  function saveTrees() {
    localStorage.setItem(STORE, JSON.stringify({ version: 2, trees: trees }));
  }

  let trees = loadTrees();
  let mode = "walk";
  let active = null;
  let history = [];

  function uid(prefix) {
    return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  }
  function esc(s) {
    return String(s || "").replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[c]));
  }

  function setMode(m) {
    mode = m;
    modeWalk.classList.toggle("active", m === "walk");
    modeEdit.classList.toggle("active", m === "edit");
    editBar.hidden = m !== "edit";
    renderMenu();
    if (active) renderTree({ animateLast: false });
  }
  modeWalk.onclick = () => setMode("walk");
  modeEdit.onclick = () => setMode("edit");

  function renderMenu() {
    menu.innerHTML = "";
    Object.keys(trees).forEach((id) => {
      const b = document.createElement("button");
      b.textContent = trees[id].title;
      b.onclick = () => start(id);
      menu.appendChild(b);
    });
  }

  function start(id) {
    active = id;
    history = [{ id: trees[id].start, answer: null }];
    menu.hidden = true;
    crumb.hidden = false;
    btnBack.disabled = true;
    renderTree({ animateLast: true });
  }

  btnReset.onclick = () => {
    active = null; history = [];
    menu.hidden = false; crumb.hidden = true;
    tree.innerHTML = ""; btnBack.disabled = true;
    renderMenu();
  };

  btnBack.onclick = () => {
    if (history.length <= 1) return;
    history.pop();
    history[history.length - 1].answer = null;
    renderTree({ animateLast: false });
  };

  function jumpTo(i) {
    if (i < 0 || i >= history.length - 1) return;
    history = history.slice(0, i + 1);
    history[history.length - 1].answer = null;
    renderTree({ animateLast: false });
  }

  function openDlg(title, bodyHtml, onSave) {
    dlgTitle.textContent = title;
    dlgBody.innerHTML = bodyHtml;
    dlg.showModal();
    $("dlgCancel").onclick = () => dlg.close();
    $("dlgSave").onclick = () => { if (onSave()) dlg.close(); };
  }

  function nodeHtml(n, h, i, isLast) {
    const cls = n.kind === "end" ? "end" : (i === 0 ? "root" : "q");
    const past = !isLast ? " past" : "";
    const tag = n.kind === "end" ? "Zaver" : (isLast ? "Otazka" : "Otazka · hotova");
    let html = '<div class="step"><div class="node ' + cls + past + '" data-hist="' + i + '">';
    html += '<div class="tag">' + tag + (h.answer ? (" · " + h.answer) : "") + "</div>";
    html += n.kind === "end" ? '<div class="endtext"></div>' : '<div class="qtext"></div>';
    if (!isLast) html += '<div class="hint-back">Klik = spat na tento krok</div>';
    if (isLast && n.kind === "q" && mode === "walk") {
      html += '<div class="choice">' +
        '<button type="button" class="yes" data-a="ANO" data-next="' + n.yes + '">ANO</button>' +
        '<button type="button" class="no" data-a="NIE" data-next="' + n.no + '">NIE</button></div>';
    }
    if (mode === "edit") {
      html += '<div class="edit-actions">' +
        '<button type="button" data-ed="text" data-nid="' + h.id + '">Upravit text</button>' +
        (n.kind === "q" ? '<button type="button" data-ed="links" data-nid="' + h.id + '">ANO/NIE ciele</button>' : "") +
        '<button type="button" data-ed="addq" data-nid="' + h.id + '">+ Otazka za ANO</button>' +
        '<button type="button" data-ed="adde" data-nid="' + h.id + '">+ Zaver za NIE</button>' +
        '<button type="button" data-ed="del" data-nid="' + h.id + '">Zmazat uzol</button></div>';
    }
    html += "</div></div>";
    return html;
  }

  function previewHtml(T, node) {
    if (!node || node.kind !== "q" || mode !== "walk") return "";
    const y = T.nodes[node.yes], n = T.nodes[node.no];
    const ytxt = y ? (y.kind === "end" ? (y.text || "").slice(0, 80) + "…" : y.text) : "?";
    const ntxt = n ? (n.kind === "end" ? (n.text || "").slice(0, 80) + "…" : n.text) : "?";
    return '<div class="preview-wrap step"><div class="trunk"></div><div class="branch-row">' +
      '<div class="branch left"><div class="elbow"></div><div class="node" style="font-size:.88rem"><div class="tag">Ak ANO</div>' + esc(ytxt) + "</div></div>" +
      '<div class="branch right"><div class="elbow"></div><div class="node" style="font-size:.88rem"><div class="tag">Ak NIE</div>' + esc(ntxt) + "</div></div></div></div>";
  }

  function renderTree(opts) {
    opts = opts || {};
    const T = trees[active];
    if (!T) return;
    btnBack.disabled = history.length <= 1;
    crumb.innerHTML = "<strong>Cesta:</strong> " + history.map((h, i) => {
      const n = T.nodes[h.id];
      const label = !n ? "?" : (n.kind === "end" ? "zaver" : ("krok " + (i + 1)));
      return "<span>" + label + (h.answer ? (" · " + h.answer) : "") + "</span>";
    }).join("");

    // Keep scroll position stable — no jump to top
    const y = window.scrollY;
    let html = "";
    history.forEach((h, i) => {
      const n = T.nodes[h.id];
      if (!n) return;
      if (i > 0) html += '<div class="trunk"></div>';
      html += nodeHtml(n, h, i, i === history.length - 1);
    });
    const cur = history[history.length - 1];
    html += previewHtml(T, T.nodes[cur.id]);
    tree.innerHTML = html;

    // fill text
    const nodes = tree.querySelectorAll(".node[data-hist]");
    history.forEach((h, i) => {
      const n = T.nodes[h.id];
      if (!n || !nodes[i]) return;
      const box = nodes[i].querySelector(".qtext, .endtext");
      if (box) box.textContent = n.text || "";
    });

    // only animate the newest step
    if (opts.animateLast === false) {
      tree.querySelectorAll(".step").forEach((el) => { el.style.animation = "none"; });
    } else {
      tree.querySelectorAll(".step").forEach((el, idx, list) => {
        if (idx < list.length - 1) el.style.animation = "none";
      });
    }

    tree.querySelectorAll(".node.past").forEach((el) => {
      el.onclick = () => jumpTo(Number(el.getAttribute("data-hist")));
    });
    tree.querySelectorAll(".choice button").forEach((btn) => {
      btn.onclick = () => {
        history[history.length - 1].answer = btn.dataset.a;
        history.push({ id: btn.dataset.next, answer: null });
        renderTree({ animateLast: true });
        // gentle scroll only if new content is below fold
        const last = tree.querySelector(".step:last-child");
        if (last) {
          const rect = last.getBoundingClientRect();
          if (rect.bottom > window.innerHeight - 24) {
            last.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        }
      };
    });
    tree.querySelectorAll(".edit-actions button").forEach((btn) => {
      btn.onclick = (ev) => { ev.stopPropagation(); handleEdit(btn.dataset.ed, btn.dataset.nid); };
    });
    window.scrollTo(0, y);
  }

  function handleEdit(action, nid) {
    const T = trees[active];
    if (!T) return;
    const n = T.nodes[nid];
    if (action === "text") {
      openDlg("Upravit text", '<label>Text</label><textarea id="fText"></textarea>', () => {
        T.nodes[nid].text = $("fText").value.trim() || T.nodes[nid].text;
        saveTrees(); renderTree({ animateLast: false }); return true;
      });
      $("fText").value = n.text || "";
    } else if (action === "links" && n.kind === "q") {
      const opts = Object.keys(T.nodes).map((id) => {
        const nn = T.nodes[id];
        return '<option value="' + id + '">' + id + " · " + (nn.kind === "end" ? "zaver" : "otazka") + " · " + esc((nn.text || "").slice(0, 40)) + "</option>";
      }).join("");
      openDlg("ANO / NIE ciele",
        '<label>Pri ANO chod na</label><select id="fYes">' + opts + '</select>' +
        '<label>Pri NIE chod na</label><select id="fNo">' + opts + '</select>',
        () => { n.yes = $("fYes").value; n.no = $("fNo").value; saveTrees(); renderTree({ animateLast: false }); return true; });
      $("fYes").value = n.yes; $("fNo").value = n.no;
    } else if (action === "addq" || action === "adde") {
      const kind = action === "addq" ? "q" : "end";
      const newId = uid(kind === "q" ? "q" : "e");
      if (kind === "q") T.nodes[newId] = { kind: "q", text: "Nova otazka", yes: nid, no: nid };
      else T.nodes[newId] = { kind: "end", text: "Novy zaver — dopln text." };
      if (n.kind === "q") { if (action === "addq") n.yes = newId; else n.no = newId; }
      saveTrees(); renderTree({ animateLast: false }); handleEdit("text", newId);
    } else if (action === "del") {
      if (nid === T.start) { alert("Startovaci uzol nemaz."); return; }
      if (!confirm("Zmazat tento uzol?")) return;
      delete T.nodes[nid];
      Object.keys(T.nodes).forEach((id) => {
        const nn = T.nodes[id];
        if (nn.kind === "q") {
          if (nn.yes === nid) nn.yes = T.start;
          if (nn.no === nid) nn.no = T.start;
        }
      });
      history = [{ id: T.start, answer: null }];
      saveTrees(); renderTree({ animateLast: false });
    }
  }

  $("btnAddTree").onclick = () => {
    openDlg("Novy strom", '<label>Nazov</label><input id="fTitle" /><label>Prva otazka</label><textarea id="fFirst"></textarea>', () => {
      const title = $("fTitle").value.trim();
      const first = $("fFirst").value.trim();
      if (!title || !first) { alert("Vypln nazov aj otazku"); return false; }
      const id = uid("t"), q = uid("q"), eY = uid("e"), eN = uid("e");
      trees[id] = { title, start: q, nodes: {
        [q]: { kind: "q", text: first, yes: eY, no: eN },
        [eY]: { kind: "end", text: "Zaver pri ANO — uprav." },
        [eN]: { kind: "end", text: "Zaver pri NIE — uprav." }
      }};
      saveTrees(); renderMenu(); start(id); setMode("edit"); return true;
    });
  };
  $("btnRenameTree").onclick = () => {
    if (!active) return;
    openDlg("Premenovat", '<label>Nazov</label><input id="fTitle" />', () => {
      trees[active].title = $("fTitle").value.trim() || trees[active].title;
      saveTrees(); renderMenu(); return true;
    });
    $("fTitle").value = trees[active].title;
  };
  $("btnDeleteTree").onclick = () => {
    if (!active) return;
    if (!confirm("Zmazat cely strom?")) return;
    delete trees[active]; saveTrees(); btnReset.onclick();
  };

  // Backup only — optional
  $("btnExport").onclick = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify({ version: 2, trees }, null, 2)], { type: "application/json" }));
    a.download = "poruchovy-strom-zaloha.json";
    a.click();
  };
  $("importFile").onchange = async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      if (!data.trees) throw new Error("Zly format");
      trees = data.trees; saveTrees(); btnReset.onclick();
    } catch (err) { alert("Import zlyhal: " + err.message); }
    e.target.value = "";
  };
  $("btnDemo").onclick = () => {
    if (!confirm("Vratit demo stromy? Tvoje ulozene upravy v prehliadaci sa prepisu.")) return;
    trees = demoTrees(); saveTrees(); btnReset.onclick();
  };

  renderMenu();
})();
