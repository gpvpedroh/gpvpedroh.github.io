/* Script comum a todas as páginas. Não faz nenhuma conexão com outros servidores. */
(function () {
  "use strict";

  /* ============================================================
     AGENDAMENTO: link da página "Primeira sessão" do Google Agenda.
     Enquanto ficar vazio, os botões de agendamento abrem o WhatsApp.
     (O link da página "Reposição de sessão" nunca vai para o site.)
     ============================================================ */
  var AGENDA_URL = "https://calendar.app.google/9tmCYK5vvfoNFWci6";

  /* Links antigos (site em página única) continuam funcionando:
     gpvpedroh.github.io/#phq-9 leva para phq-9.html, e assim por diante. */
  var SCALE_PAGES = {
    "phq-9": "phq-9.html", "phq-4": "phq-9.html",
    "gad-7": "gad-7.html",
    "dass-21": "dass-21.html",
    "who-5": "who-5.html",
    "audit": "audit.html", "audit-c": "audit.html"
  };
  var SECTION_PAGES = {
    "sobre": "sobre.html",
    "atendimento": "atendimento.html",
    "escalas": "escalas.html",
    "publicacoes": "publicacoes.html",
    "contato": "contato.html",
    "agendar": "contato.html#agendar",
    "privacidade": "contato.html#privacidade"
  };

  var page = document.body.getAttribute("data-page");
  var hash = (location.hash || "").replace("#", "");
  var target = SCALE_PAGES[hash] || (page === "inicio" ? SECTION_PAGES[hash] : null);
  if (target) { location.replace(target); return; }

  if (AGENDA_URL) {
    Array.prototype.forEach.call(document.querySelectorAll(".js-agendar"), function (a) { a.href = AGENDA_URL; });
    Array.prototype.forEach.call(document.querySelectorAll(".js-agendar-nota"), function (p) {
      p.textContent = "Abre a agenda do Google em nova aba. Você informa nome, e-mail e telefone. Não é preciso dizer o motivo da consulta. Se preferir, agende pelo WhatsApp.";
    });
    Array.prototype.forEach.call(document.querySelectorAll(".js-agenda-only"), function (p) { p.hidden = false; });
  }
})();
