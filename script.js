let estadoContraste = false;

const btnContraste = document.getElementById("btn-contraste");
const btnAumentar = document.getElementById("btn-aumentar");
const btnDiminuir = document.getElementById("btn-diminuir");
const root = document.documentElement;
const statusAcessibilidade = document.getElementById("acessibilidade-status");

const campoTelefone = document.getElementById("telefone");
const campoCpf = document.getElementById("cpf");
const campoNascimento = document.getElementById("nascimento");

const passoFonte = 2;
const maxFontSize = 30;
const minFontSize = 12;

let fontSizeAtual = 16;

function anunciarStatus(mensagem) {
  if (!statusAcessibilidade) {
    return;
  }

  statusAcessibilidade.textContent = "";
  window.setTimeout(() => {
    statusAcessibilidade.textContent = mensagem;
  }, 10);
}

const contrasteArmazenado = localStorage.getItem("estadoContraste");
if (contrasteArmazenado !== null) {
  estadoContraste = contrasteArmazenado === "true";
}

if (estadoContraste) {
  document.body.classList.add("alto-contraste");
}

if (btnContraste) {
  btnContraste.setAttribute("aria-pressed", String(estadoContraste));

  btnContraste.addEventListener("click", () => {
    estadoContraste = !estadoContraste;

    localStorage.setItem("estadoContraste", String(estadoContraste));
    btnContraste.setAttribute("aria-pressed", String(estadoContraste));

    if (estadoContraste) {
      document.body.classList.add("alto-contraste");
      anunciarStatus("Alto contraste ativado.");
    } else {
      document.body.classList.remove("alto-contraste");
      anunciarStatus("Alto contraste desativado.");
    }
  });
}

function atualizarFonte(novoTamanho) {
  fontSizeAtual = novoTamanho;
  root.style.setProperty("--base-font", `${fontSizeAtual}px`);
  localStorage.setItem("fontSizeAtual", String(fontSizeAtual));
  anunciarStatus(`Tamanho da fonte ajustado para ${fontSizeAtual} pixels.`);
}

const fonteSalva = localStorage.getItem("fontSizeAtual");
if (fonteSalva) {
  const tamanho = Number.parseInt(fonteSalva, 10);
  if (!Number.isNaN(tamanho)) {
    atualizarFonte(tamanho);
  }
}

if (btnAumentar) {
  btnAumentar.addEventListener("click", () => {
    if (fontSizeAtual < maxFontSize) {
      atualizarFonte(fontSizeAtual + passoFonte);
    }
  });
}

if (btnDiminuir) {
  btnDiminuir.addEventListener("click", () => {
    if (fontSizeAtual > minFontSize) {
      atualizarFonte(fontSizeAtual - passoFonte);
    }
  });
}

function aplicarMascara(campo, formatador) {
  if (!campo) {
    return;
  }

  campo.addEventListener("input", (event) => {
    event.target.value = formatador(event.target.value);
  });
}

function formatarTelefone(valor) {
  const numeros = valor.replace(/\D/g, "").slice(0, 11);

  if (numeros.length <= 2) {
    return numeros.length ? `(${numeros}` : "";
  }

  if (numeros.length <= 6) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
  }

  if (numeros.length <= 10) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
  }

  return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
}

function formatarCpf(valor) {
  const numeros = valor.replace(/\D/g, "").slice(0, 11);

  if (numeros.length <= 3) {
    return numeros;
  }

  if (numeros.length <= 6) {
    return `${numeros.slice(0, 3)}.${numeros.slice(3)}`;
  }

  if (numeros.length <= 9) {
    return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6)}`;
  }

  return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9)}`;
}

function formatarDataNascimento(valor) {
  const numeros = valor.replace(/\D/g, "").slice(0, 8);
  const partes = [];

  if (numeros.length > 0) {
    partes.push(numeros.slice(0, 2));
  }

  if (numeros.length > 2) {
    partes.push(numeros.slice(2, 4));
  }

  if (numeros.length > 4) {
    partes.push(numeros.slice(4, 8));
  }

  return partes.join("/");
}

aplicarMascara(campoTelefone, formatarTelefone);
aplicarMascara(campoCpf, formatarCpf);
aplicarMascara(campoNascimento, formatarDataNascimento);
