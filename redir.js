/* Este endereço mudou. Leva o visitante para a mesma página no endereço novo. */
(function () {
  var NOVO = "https://psipedrohenrique.github.io";
  var MAPA = {
    "phq-9": "/phq-9.html", "phq-4": "/phq-9.html", "gad-7": "/gad-7.html",
    "dass-21": "/dass-21.html", "who-5": "/who-5.html", "audit": "/audit.html", "audit-c": "/audit.html",
    "sobre": "/sobre.html", "atendimento": "/atendimento.html", "escalas": "/escalas.html",
    "publicacoes": "/publicacoes.html", "contato": "/contato.html",
    "agendar": "/contato.html#agendar", "privacidade": "/contato.html#privacidade"
  };
  var path = location.pathname;
  var hash = (location.hash || "").replace("#", "");
  var destino = NOVO + path + location.hash;
  if ((path === "/" || path === "/index.html") && MAPA[hash]) destino = NOVO + MAPA[hash];
  location.replace(destino);
})();
