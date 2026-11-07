// Menú adaptable para celulares
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", function () {
  navLinks.classList.toggle("active");
});

// Cerrar menú al seleccionar una sección
document.querySelectorAll(".nav-links a").forEach(function (link) {
  link.addEventListener("click", function () {
    navLinks.classList.remove("active");
  });
});

// Suscripción a Mailchimp (doble opt-in configurado en la audiencia)
const mcForm = document.getElementById("mailchimpForm");
const mcMessage = document.getElementById("formMessage");
const mcButton = document.getElementById("subscribeBtn");

function mcShow(text, isError) {
  mcMessage.textContent = text;
  mcMessage.classList.toggle("error", Boolean(isError));
}

mcForm.addEventListener("submit", function (event) {
  event.preventDefault();

  if (!mcForm.checkValidity()) {
    mcForm.reportValidity();
    return;
  }

  const action = mcForm.getAttribute("action");

  if (action.indexOf("TU_") !== -1) {
    mcShow("Falta configurar la URL de Mailchimp en el formulario.", true);
    return;
  }

  // Se envía por JSONP para no salir de la página
  const params = new URLSearchParams(new FormData(mcForm));
  params.delete("consentimiento");
  params.set("c", "mcCallback");

  const url = action.replace("/subscribe/post?", "/subscribe/post-json?")
    + "&" + params.toString();

  mcButton.disabled = true;
  mcShow("Enviando…", false);

  const script = document.createElement("script");
  let finished = false;

  function finish() {
    finished = true;
    mcButton.disabled = false;
    script.remove();
  }

  const timer = setTimeout(function () {
    if (finished) return;
    finish();
    mcShow("No pudimos conectar. Intentá de nuevo en unos minutos.", true);
  }, 10000);

  window.mcCallback = function (data) {
    clearTimeout(timer);
    finish();

    if (data && data.result === "success") {
      mcShow("¡Casi listo! Revisá tu correo y confirmá tu suscripción.", false);
      mcForm.reset();
    } else if (data && /already subscribed/i.test(data.msg || "")) {
      mcShow("Este correo ya está suscripto.", true);
    } else {
      mcShow("No pudimos completar la suscripción. Revisá el correo ingresado e intentá de nuevo.", true);
    }
  };

  script.onerror = function () {
    clearTimeout(timer);
    finish();
    mcShow("No pudimos conectar. Intentá de nuevo en unos minutos.", true);
  };

  script.src = url;
  document.body.appendChild(script);
});
