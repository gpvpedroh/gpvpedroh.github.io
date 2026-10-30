/* Escalas de acompanhamento. Tudo é calculado no navegador: nada é enviado nem armazenado. */
(function () {
  "use strict";

  var panelEl = document.getElementById("panel");
  if (!panelEl) return;

  function opts(labels, values) {
    return labels.map(function (t, i) { return { t: t, v: values ? values[i] : i }; });
  }

  var FREQ = opts(["Nenhuma vez", "Vários dias", "Mais da metade dos dias", "Quase todos os dias"]);
  var DASS = opts(["Não se aplicou de maneira alguma", "Aplicou-se em algum grau, ou por pouco tempo", "Aplicou-se em algum grau considerável, ou por uma boa parte do tempo", "Aplicou-se muito, ou na maioria do tempo"]);
  var WHO = opts(["O tempo todo", "A maioria do tempo", "Mais do que a metade do tempo", "Menos do que a metade do tempo", "Às vezes", "Em nenhum momento"], [5, 4, 3, 2, 1, 0]);
  var AUD_FREQ = opts(["Nunca", "Menos que uma vez ao mês", "Uma vez ao mês", "Uma vez por semana", "Todos os dias ou quase todos"]);
  var AUD_SIM = opts(["Não", "Sim, mas não no último ano", "Sim, durante o último ano"], [0, 2, 4]);

  function band(score, cuts) {
    for (var i = 0; i < cuts.length; i++) {
      if (score <= cuts[i].max) return { label: cuts[i].label, sev: cuts[i].sev };
    }
    var last = cuts[cuts.length - 1];
    return { label: last.label, sev: last.sev };
  }
  function sum(a) { return a.reduce(function (s, v) { return s + v; }, 0); }

  var RISK_HTML =
    "<strong class=\"title\">Sua resposta merece atenção agora.</strong>" +
    "<p>Você marcou que, nas últimas duas semanas, teve pensamentos de se ferir ou de que seria melhor estar morto(a).</p>" +
    "<ul>" +
    "<li>Se você corre perigo agora ou pensa em se ferir: ligue <strong>192 (SAMU)</strong> ou vá ao pronto-socorro mais próximo. Fora do Brasil, ligue para o número de emergência local.</li>" +
    "<li>Para conversar com alguém agora, a qualquer hora: <strong>188 (CVV)</strong>, gratuito.</li>" +
    "<li>Envie este resultado para mim. Eu posso não ver a mensagem na hora; por isso, se for urgente, não espere a minha resposta.</li>" +
    "</ul>";

  var SCALES = [
    {
      id: "phq-9", name: "PHQ-9",
      instr: "Durante as últimas 2 semanas, com que frequência você foi incomodado/a por qualquer um dos problemas abaixo?",
      about: "Questionário sobre a Saúde do/a Paciente. Avalia a intensidade de sintomas de depressão nas últimas duas semanas.",
      ref: "Kroenke K, Spitzer RL, Williams JBW. J Gen Intern Med. 2001;16(9):606-13. Versão em português do Brasil: Pfizer. Ponto de corte estudado no Brasil: Osório FL et al. Perspect Psychiatr Care. 2009;45(3):216-27. Desenvolvido pelos Drs. Robert L. Spitzer, Janet B.W. Williams, Kurt Kroenke e colegas, com um subsídio educacional da Pfizer Inc. Não é necessária permissão para reproduzir, traduzir, exibir ou distribuir.",
      options: FREQ,
      riskItem: 8,
      items: [
        "Pouco interesse ou pouco prazer em fazer as coisas",
        "Se sentir “para baixo”, deprimido/a ou sem perspectiva",
        "Dificuldade para pegar no sono ou permanecer dormindo, ou dormir mais do que de costume",
        "Se sentir cansado/a ou com pouca energia",
        "Falta de apetite ou comendo demais",
        "Se sentir mal consigo mesmo/a — ou achar que você é um fracasso ou que decepcionou sua família ou você mesmo/a",
        "Dificuldade para se concentrar nas coisas, como ler o jornal ou ver televisão",
        "Lentidão para se movimentar ou falar, a ponto das outras pessoas perceberem? Ou o oposto – estar tão agitado/a ou irrequieto/a que você fica andando de um lado para o outro muito mais do que de costume",
        "Pensar em se ferir de alguma maneira ou que seria melhor estar morto/a"
      ],
      extra: {
        label: "Dificuldade no dia a dia",
        q: "Se você assinalou qualquer um dos problemas, indique o grau de dificuldade que os mesmos lhe causaram para realizar seu trabalho, tomar conta das coisas em casa ou para se relacionar com as pessoas?",
        hint: "Esta pergunta não soma pontos.",
        options: ["Nenhuma dificuldade", "Alguma dificuldade", "Muita dificuldade", "Extrema dificuldade"]
      },
      score: function (a) {
        var t = sum(a);
        var b = band(t, [
          { max: 4, label: "Sintomas mínimos", sev: 0 }, { max: 9, label: "Sintomas leves", sev: 1 },
          { max: 14, label: "Sintomas moderados", sev: 2 }, { max: 19, label: "Moderadamente graves", sev: 3 },
          { max: 27, label: "Sintomas graves", sev: 4 }
        ]);
        return {
          total: t, max: 27, band: b,
          subs: [{ name: "Ponto de corte (10 pontos)", text: t >= 10 ? "Atingido" : "Não atingido", band: t >= 10 ? { label: "Avaliar", sev: 2 } : null }],
          explain: "Total de 0 a 27: 0–4 sintomas mínimos, 5–9 leves, 10–14 moderados, 15–19 moderadamente graves, 20–27 graves. Essas faixas não foram validadas no Brasil. A partir de 10 pontos, vale uma avaliação mais aprofundada. Em um estudo brasileiro com outro formato de resposta, o corte foi de 9 pontos (Santos et al., 2013)."
        };
      }
    },
    {
      id: "gad-7", name: "GAD-7",
      instr: "Durante as duas últimas semanas, com que frequência você foi incomodado/a pelos problemas abaixo?",
      about: "Avalia a intensidade de sintomas de ansiedade generalizada nas últimas duas semanas.",
      ref: "Spitzer RL, Kroenke K, Williams JBW, Löwe B. Arch Intern Med. 2006;166(10):1092-7. Versão em português do Brasil: Pfizer. Evidências no Brasil: Monteiro RP et al. Int J Ment Health Addict. 2022;20:1023-34. Uso livre, sem necessidade de permissão.",
      options: FREQ,
      items: [
        "Sentir-se nervoso/a, ansioso/a ou muito tenso/a",
        "Não ser capaz de impedir ou de controlar as preocupações",
        "Preocupar-se muito com diversas coisas",
        "Dificuldade para relaxar",
        "Ficar tão agitado/a que se torna difícil permanecer sentado/a",
        "Ficar facilmente aborrecido/a ou irritado/a",
        "Sentir medo como se algo horrível fosse acontecer"
      ],
      score: function (a) {
        var t = sum(a);
        var b = band(t, [
          { max: 4, label: "Ansiedade mínima", sev: 0 }, { max: 9, label: "Ansiedade leve", sev: 1 },
          { max: 14, label: "Ansiedade moderada", sev: 2 }, { max: 21, label: "Ansiedade grave", sev: 3 }
        ]);
        return {
          total: t, max: 21, band: b, subs: [],
          explain: "Total de 0 a 21: 0–4 ansiedade mínima, 5–9 leve, 10–14 moderada, 15–21 grave. A partir de 10 pontos, recomenda-se uma avaliação mais aprofundada. Ainda não há ponto de corte clínico estudado no Brasil."
        };
      }
    },
    {
      id: "dass-21", name: "DASS-21",
      instr: "Leia cada afirmação e marque o quanto ela se aplicou a você durante a última semana.",
      about: "Mede três estados emocionais em subescalas de 7 itens. A soma de cada subescala é multiplicada por 2, como manda a correção da escala.",
      ref: "Lovibond SH, Lovibond PF. Manual for the DASS. 1995. Versão brasileira: Vignola RCB, Tucci AM. J Affect Disord. 2014;155:104-9. Domínio público. Pontos de corte do manual original; ainda não há normas brasileiras.",
      options: DASS,
      items: [
        "Achei difícil me acalmar",
        "Senti minha boca seca",
        "Não consegui vivenciar nenhum sentimento positivo",
        "Tive dificuldade em respirar em alguns momentos (ex.: respiração ofegante, falta de ar, sem ter feito esforço físico)",
        "Achei difícil ter iniciativa para fazer as coisas",
        "Tive a tendência de reagir de forma exagerada às situações",
        "Senti tremores (ex.: nas mãos)",
        "Senti que estava sempre nervoso(a)",
        "Preocupei-me com situações em que eu pudesse entrar em pânico e parecesse ridículo(a)",
        "Senti que não tinha nada a desejar",
        "Senti-me agitado(a)",
        "Achei difícil relaxar",
        "Senti-me depressivo(a) e sem ânimo",
        "Fui intolerante com as coisas que me impediam de continuar o que eu estava fazendo",
        "Senti que ia entrar em pânico",
        "Não consegui me entusiasmar com nada",
        "Senti que não tinha valor como pessoa",
        "Senti que estava um pouco emotivo(a)/sensível demais",
        "Sabia que meu coração estava alterado mesmo não tendo feito nenhum esforço físico (ex.: aumento da frequência cardíaca, disritmia cardíaca)",
        "Senti medo sem ter motivo",
        "Senti que a vida não tinha sentido"
      ],
      score: function (a) {
        function sub(idx) { return idx.reduce(function (s, i) { return s + a[i - 1]; }, 0) * 2; }
        var d = sub([3, 5, 10, 13, 16, 17, 21]);
        var x = sub([2, 4, 7, 9, 15, 19, 20]);
        var s = sub([1, 6, 8, 11, 12, 14, 18]);
        var L = ["Normal", "Leve", "Moderado", "Grave", "Extremamente grave"];
        function cut(v, c) { var b = 4; for (var i = 0; i < c.length; i++) { if (v <= c[i]) { b = i; break; } } return { label: L[b], sev: b }; }
        var bd = cut(d, [9, 13, 20, 27]), bx = cut(x, [7, 9, 14, 19]), bs = cut(s, [14, 18, 25, 33]);
        var worst = [bd, bx, bs].reduce(function (m, b) { return b.sev > m.sev ? b : m; });
        return {
          total: null, max: null, band: worst, headline: "Maior faixa entre as subescalas",
          subs: [
            { name: "Depressão", v: d, max: 42, band: bd },
            { name: "Ansiedade", v: x, max: 42, band: bx },
            { name: "Estresse", v: s, max: 42, band: bs }
          ],
          explain: "Faixas (já multiplicadas por 2). Depressão: até 9 normal, 10–13 leve, 14–20 moderado, 21–27 grave, 28+ extremamente grave. Ansiedade: até 7, 8–9, 10–14, 15–19, 20+. Estresse: até 14, 15–18, 19–25, 26–33, 34+."
        };
      }
    },
    {
      id: "who-5", name: "WHO-5",
      instr: "Marque a alternativa que melhor descreve como você se sentiu nas últimas duas semanas.",
      about: "Índice de Bem-Estar da Organização Mundial da Saúde. Aqui, pontuações mais altas são melhores.",
      ref: "World Health Organization. The World Health Organization-Five Well-Being Index (WHO-5). Geneva: WHO; 2024. Licença CC BY-NC-SA 3.0 IGO. Versão brasileira: Souza CM, Hidalgo MPL. Eur Arch Psychiatry Clin Neurosci. 2012;262(3):239-44. Esta tradução não foi criada pela OMS.",
      options: WHO,
      prefix: "Nas últimas duas semanas…",
      items: [
        "…eu estava alegre e de bom humor",
        "…me senti calmo(a) e relaxado(a)",
        "…me senti disposto(a) e renovado(a) ao acordar",
        "…me senti cheio(a) de energia e ativo(a)",
        "…o meu dia foi cheio de coisas que me interessavam"
      ],
      score: function (a) {
        var raw = sum(a);
        var b = raw >= 13 ? { label: "Bem-estar adequado", sev: 0 } : { label: "Bem-estar reduzido", sev: 2 };
        return {
          total: raw, max: 25, band: b,
          subs: [{ name: "Em percentual", text: (raw * 4) + "%", band: null }],
          explain: "Pontuação de 0 a 25 (ou 0 a 100%). Abaixo de 13 pontos (50%) indica bem-estar reduzido e merece atenção em sessão."
        };
      }
    },
    {
      id: "audit", name: "AUDIT",
      instr: "Marque a alternativa que ficar mais próxima da sua resposta.",
      about: "Teste para Identificação de Problemas Relacionados ao Uso de Álcool, da Organização Mundial da Saúde. Nas perguntas 2 e 3, transforme o que você bebe em “doses” usando a tabela abaixo.",
      extraHtml:
        "<div class=\"doses\"><strong>Como contar as “doses”</strong><ul>" +
        "<li><b>Cerveja:</b> 1 copo de chope (350 ml) ou 1 lata = 1 dose; 1 garrafa = 2 doses</li>" +
        "<li><b>Vinho:</b> 1 copo comum grande (250 ml) = 2 doses; 1 garrafa = 8 doses</li>" +
        "<li><b>Cachaça, vodca, uísque ou conhaque:</b> 1 “martelinho” (60 ml) = 2 doses; 1 “martelo” (100 ml) = 3 doses; 1 garrafa = mais de 20 doses</li>" +
        "<li><b>Uísque, rum, licor etc.:</b> 1 dose de dosador (45 a 50 ml) = 1 dose</li></ul>" +
        "<p class=\"who\">A Organização Mundial da Saúde usa como referência uma dose padrão de 10 g de álcool puro. Esta versão brasileira do AUDIT usa equivalências aproximadas em medidas comuns, como as da tabela acima.</p></div>",
      ref: "Babor TF, Higgins-Biddle JC, Saunders JB, Monteiro MG. AUDIT: guidelines for use in primary care. 2nd ed. Geneva: WHO; 2001. Versão brasileira: Méndez EB. Uma versão brasileira do AUDIT. Dissertação (Mestrado), Universidade Federal de Pelotas; 1999. Uso livre.",
      perItem: [
        opts(["Nunca", "Uma vez por mês ou menos", "Duas a quatro vezes por mês", "Duas a três vezes por semana", "Quatro ou mais vezes por semana"]),
        opts(["1 ou 2 “doses”", "3 ou 4 “doses”", "5 ou 6 “doses”", "7 a 9 “doses”", "10 ou mais “doses”"]),
        AUD_FREQ, AUD_FREQ, AUD_FREQ, AUD_FREQ, AUD_FREQ, AUD_FREQ,
        AUD_SIM, AUD_SIM
      ],
      items: [
        "Com que frequência você consome bebidas alcoólicas?",
        "Nas ocasiões em que bebe, quantas doses, copos ou garrafas você costuma tomar?",
        "Com que frequência você toma seis ou mais doses em uma ocasião?",
        "Com que frequência, durante o último ano, você achou que não seria capaz de controlar a quantidade de bebida depois de começar?",
        "Com que frequência, durante o último ano, você não conseguiu cumprir com algum compromisso por causa da bebida?",
        "Com que frequência, durante o último ano, depois de ter bebido muito, você precisou beber pela manhã para se sentir melhor?",
        "Com que frequência, durante o último ano, você sentiu culpa ou remorso depois de beber?",
        "Com que frequência, durante o último ano, você não conseguiu se lembrar do que aconteceu na noite anterior por causa da bebida?",
        "Alguma vez na vida você ou alguma outra pessoa já se machucou, se prejudicou porque você bebeu?",
        "Alguma vez na vida algum parente, amigo, médico ou outro profissional da saúde já se preocupou com você por causa de bebida ou te disse para parar de beber?"
      ],
      score: function (a) {
        var t = sum(a);
        var b = band(t, [
          { max: 7, label: "Baixo risco", sev: 0 }, { max: 15, label: "Uso de risco", sev: 1 },
          { max: 19, label: "Uso nocivo", sev: 2 }, { max: 40, label: "Provável dependência", sev: 3 }
        ]);
        return {
          total: t, max: 40, band: b, subs: [],
          explain: "Total de 0 a 40. Zonas: 0–7 baixo risco, 8–15 uso de risco, 16–19 uso nocivo, 20–40 provável dependência. O ponto de corte de 8 pontos foi estudado no Brasil (Méndez, 1999). Alguns autores sugerem cortes menores para mulheres e idosos."
        };
      }
    }
  ];

  function byId(id) { return SCALES.filter(function (x) { return x.id === id; })[0]; }

  /* Cada página de escala diz qual escala mostrar: <div id="panel" data-scale="phq-9"> */
  var s = byId(panelEl.getAttribute("data-scale"));
  if (!s) return;

  var answers = new Array(s.items.length).fill(null);
  var extra = null;
  var riskSeen = false;
  var revealed = false; /* a animação do resultado aparece só na primeira vez que ele fica completo */

  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function optionsFor(idx) { return s.perItem ? s.perItem[idx] : s.options; }

  function radioGroup(name, list, checkedValue, onChange) {
    var box = el("div", { "class": "opts" });
    list.forEach(function (o, k) {
      var id = name + "-o" + k;
      var wrap = el("div", { "class": "opt" });
      var inp = el("input", { type: "radio", name: name, id: id, value: String(o.v) });
      if (checkedValue === o.v) inp.checked = true;
      inp.addEventListener("change", function () { onChange(o.v); });
      wrap.appendChild(inp);
      /* O valor de cada opção não aparece na tela, para não influenciar a resposta */
      wrap.appendChild(el("label", { "for": id }, esc(o.t)));
      box.appendChild(wrap);
    });
    return box;
  }

  function renderPanel() {
    panelEl.innerHTML = "";
    var wrap = el("div", { "class": "scale" });
    var main = el("div", { "class": "scale-main" });
    main.appendChild(el("div", { "class": "scale-info" },
      "<p class=\"instr\">" + esc(s.instr) + "</p><p>" + esc(s.about) + "</p>" +
      (s.extraHtml || "") + "<small>Fonte: " + esc(s.ref) + "</small>"));

    s.items.forEach(function (text, i) {
      var fs = el("fieldset", { "class": "item" + (answers[i] != null ? " done" : "") });
      fs.appendChild(el("legend", null, "<span class=\"n\">" + (i + 1) + ".</span><span>" + esc(text) + "</span>"));
      fs.appendChild(radioGroup(s.id + "-q" + (i + 1), optionsFor(i), answers[i], function (v) {
        answers[i] = v;
        fs.classList.add("done");
        if (s.riskItem === i && v > 0) {
          riskSeen = true;
          var box = document.getElementById("risk-inline");
          if (box) box.hidden = false;
        }
        renderResult();
      }));
      main.appendChild(fs);
      if (s.riskItem === i) {
        var alertBox = el("div", { "class": "risk", id: "risk-inline", role: "alert" }, RISK_HTML);
        alertBox.hidden = !riskSeen;
        main.appendChild(alertBox);
      }
    });

    if (s.extra) {
      var fx = el("fieldset", { "class": "item extra" + (extra != null ? " done" : "") });
      fx.appendChild(el("legend", null, "<span>" + esc(s.extra.q) + "</span>"));
      fx.appendChild(el("span", { "class": "hint" }, esc(s.extra.hint)));
      /* A pergunta extra não soma pontos: guardamos só o texto escolhido */
      var box = el("div", { "class": "opts" });
      s.extra.options.forEach(function (t, k) {
        var id = s.id + "-extra-o" + k;
        var w = el("div", { "class": "opt" });
        var inp = el("input", { type: "radio", name: s.id + "-extra", id: id, value: t });
        if (extra === t) inp.checked = true;
        inp.addEventListener("change", function () { extra = t; fx.classList.add("done"); });
        w.appendChild(inp);
        w.appendChild(el("label", { "for": id }, esc(t)));
        box.appendChild(w);
      });
      fx.appendChild(box);
      main.appendChild(fx);
    }

    var aside = el("aside", { "class": "result", id: "result", "aria-live": "polite" });
    wrap.appendChild(main);
    wrap.appendChild(aside);
    panelEl.appendChild(wrap);
    renderResult();
  }

  function chip(b) { return b ? "<span class=\"chip sev-" + b.sev + "\">" + esc(b.label) + "</span>" : ""; }

  function today() {
    var d = new Date();
    return String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0") + "/" + d.getFullYear();
  }

  function renderResult() {
    var aside = document.getElementById("result");
    var done = answers.filter(function (v) { return v != null; }).length;
    var n = answers.length;
    var html = "<h2>Resultado · " + esc(s.name) + "</h2>";
    if (riskSeen) html += "<div class=\"risk\"><strong class=\"title\">Atenção à pergunta " + (s.riskItem + 1) + "</strong><p>Se você corre perigo agora, ligue <strong>192 (SAMU)</strong> ou <strong>188 (CVV)</strong>. Fora do Brasil, ligue para o número de emergência local. Eu posso não ver a sua mensagem na hora.</p></div>";
    html += "<div class=\"progress\"><span>" + done + " de " + n + " respondidas</span><div class=\"bar\"><i></i></div></div>";

    if (done < n) {
      html += "<p class=\"empty\">Responda todas as perguntas para ver a pontuação.</p>";
      aside.innerHTML = html;
      setBar(aside, done, n);
      return;
    }
    var r = s.score(answers);
    var cls = revealed ? "" : " reveal";
    revealed = true;
    html += "<div class=\"score" + cls + "\">";
    if (r.total != null) html += "<div class=\"big\">" + r.total + " <small>de " + r.max + "</small></div>";
    else html += "<div class=\"empty\">" + esc(r.headline) + "</div>";
    html += chip(r.band) + "</div>";
    if (r.subs.length) {
      html += "<ul class=\"subs\">" + r.subs.map(function (x) {
        var val = x.text != null ? esc(x.text) : x.v + " <small>/ " + x.max + "</small>";
        return "<li><span>" + esc(x.name) + "</span><span><b>" + val + "</b> " + chip(x.band) + "</span></li>";
      }).join("") + "</ul>";
    }
    html += "<p class=\"explain\">" + esc(r.explain) + "</p>";
    html += "<div class=\"actions\">" +
      "<label class=\"ini\" for=\"ini\">Suas iniciais (opcional)<input type=\"text\" id=\"ini\" maxlength=\"12\" autocomplete=\"off\" placeholder=\"Ex.: A.B.\"></label>" +
      "<button type=\"button\" class=\"btn\" id=\"copy\">Copiar resultado</button>" +
      "<button type=\"button\" class=\"btn ghost\" id=\"clear\">Limpar respostas</button>" +
      "<div class=\"copy-status\" id=\"copy-status\" role=\"status\"></div></div>";
    aside.innerHTML = html;
    setBar(aside, done, n);

    document.getElementById("copy").addEventListener("click", function () { copyResult(r); });
    document.getElementById("clear").addEventListener("click", function () {
      answers = new Array(n).fill(null);
      extra = null;
      revealed = false;
      renderPanel();
      panelEl.scrollIntoView();
    });
  }

  /* A largura da barra é definida pelo script (e não no HTML) para respeitar a política de segurança da página */
  function setBar(aside, done, n) {
    var bar = aside.querySelector(".bar i");
    if (bar) bar.style.width = Math.round(done / n * 100) + "%";
  }

  function summary(r) {
    var ini = (document.getElementById("ini") || {}).value || "";
    var lines = ["Resultado " + s.name + " — " + today()];
    var rv = s.riskItem != null ? answers[s.riskItem] : null;
    if (rv != null && rv > 0) lines.push("ATENÇÃO: item " + (s.riskItem + 1) + " marcado (valor " + rv + ")");
    if (ini.trim()) lines.push("Iniciais: " + ini.trim());
    if (r.total != null) lines.push("Total: " + r.total + "/" + r.max + " (" + r.band.label + ")");
    r.subs.forEach(function (x) {
      lines.push(x.name + ": " + (x.text != null ? x.text : x.v + "/" + x.max) + (x.band ? " (" + x.band.label + ")" : ""));
    });
    if (s.extra && extra) lines.push(s.extra.label + ": " + extra);
    lines.push("Respostas: " + answers.map(function (v, i) { return (i + 1) + "=" + v; }).join(", "));
    return lines.join("\n");
  }

  function copyResult(r) {
    var text = summary(r);
    var status = document.getElementById("copy-status");
    function fallback() {
      status.textContent = "Não foi possível copiar automaticamente. Selecione o texto abaixo e copie.";
      var ta = document.getElementById("copy-fallback");
      if (!ta) {
        ta = el("textarea", { id: "copy-fallback", "class": "copy-fallback", readonly: "readonly", "aria-label": "Resultado para copiar" });
        status.parentNode.appendChild(ta);
      }
      ta.value = text; ta.focus(); ta.select();
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          status.textContent = "Copiado. Cole na conversa comigo pelo WhatsApp.";
        }, fallback);
      } else { fallback(); }
    } catch (e) { fallback(); }
  }

  renderPanel();
})();
