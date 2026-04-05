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

// Validação customizada para alertas em PT-BR e destaque de legendas
const inputsObrigatorios = document.querySelectorAll('[required]');
const formulario = document.querySelector('.client-form');

inputsObrigatorios.forEach(input => {
  input.addEventListener('invalid', function() {
    this.setCustomValidity(""); // Limpa para reavaliar

    if (this.validity.valueMissing) {
      const label = document.querySelector(`label[for="${this.id}"]`);
      // Extrai o nome do campo limpando marcações de obrigatoriedade
      let nomeCampo = label ? label.innerText.replace(/\*|Obrigatorio\./g, '').trim() : "este campo";
      this.setCustomValidity(`O campo "${nomeCampo}" é obrigatório.`);
    }

    const fieldset = this.closest('fieldset');
    if (fieldset) {
      const legend = fieldset.querySelector('.form-legend');
      if (legend) legend.classList.add('invalid');
    }
  });

  input.addEventListener('input', function() {
    this.setCustomValidity("");
    const fieldset = this.closest('fieldset');
    if (fieldset && fieldset.querySelectorAll(':invalid').length === 0) {
      const legend = fieldset.querySelector('.form-legend');
      if (legend) legend.classList.remove('invalid');
    }
  });
});

if (formulario) {
  formulario.addEventListener('reset', () => {
    document.querySelectorAll('.form-legend.invalid').forEach(l => l.classList.remove('invalid'));
  });
}

// Lógica para seleção de WhatsApp e Popup
const radiosContato = document.querySelectorAll('input[name="contato"]');
const modalWhatsapp = document.getElementById('modal-whatsapp');
const inputWhatsappCustom = document.getElementById('whatsapp-numero');
const btnConfirmarWhatsapp = document.getElementById('btn-confirmar-whatsapp');
const btnCancelarWhatsapp = document.getElementById('btn-cancelar-whatsapp');
let ultimoMetodoContato = 'email'; // Para reverter caso cancele

radiosContato.forEach(radio => {
  radio.addEventListener('click', (e) => {
    if (radio.value === 'whatsapp') {
      // Mesmo número do formulário
      const isSame = confirm("O número do WhatsApp é o mesmo telefone informado no cadastro?");
      
      if (!isSame) {
        modalWhatsapp.hidden = false;
        inputWhatsappCustom.focus();
      } else {
        ultimoMetodoContato = 'whatsapp';
      }
    } else {
      ultimoMetodoContato = radio.value;
    }
  });
});

btnConfirmarWhatsapp.addEventListener('click', () => {
  if (inputWhatsappCustom.value.length < 14) {
    alert("Por favor, informe um número de celular válido.");
    inputWhatsappCustom.focus();
    return;
  }
  modalWhatsapp.hidden = true;
  ultimoMetodoContato = 'whatsapp';
  anunciarStatus("Número de WhatsApp personalizado registrado com sucesso.");
});

btnCancelarWhatsapp.addEventListener('click', () => {
  modalWhatsapp.hidden = true;
  // Reverte para o último método de contato válido
  const anterior = document.querySelector(`input[name="contato"][value="${ultimoMetodoContato}"]`);
  if (anterior) anterior.checked = true;
});

// Aplica a máscara de telefone também no campo do modal
aplicarMascara(inputWhatsappCustom, formatarTelefone);

// Lógica para Upload de Arquivos
const uploadZone = document.getElementById('upload-zone');
const inputAnexos = document.getElementById('anexos');
const listaArquivos = document.getElementById('lista-arquivos');

if (uploadZone && inputAnexos) {
  // Clique na zona ativa o input
  uploadZone.addEventListener('click', () => inputAnexos.click());
  
  // Teclado (Enter ou Space) ativa o input
  uploadZone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputAnexos.click();
    }
  });

  // Drag and Drop
  ['dragover', 'dragleave', 'drop'].forEach(eventName => {
    uploadZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  });

  uploadZone.addEventListener('dragover', () => uploadZone.classList.add('dragover'));
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
  
  uploadZone.addEventListener('drop', (e) => {
    uploadZone.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
  });

  inputAnexos.addEventListener('change', () => {
    handleFiles(inputAnexos.files);
  });
}

function handleFiles(files) {
  Array.from(files).forEach(file => {
    const item = document.createElement('div');
    item.className = 'file-item';
    item.innerHTML = `
      <span>${file.name} (${(file.size / 1024).toFixed(1)} KB)</span>
      <button type="button" aria-label="Remover arquivo ${file.name}">&times;</button>
    `;
    item.querySelector('button').addEventListener('click', () => item.remove());
    listaArquivos.appendChild(item);
  });
}

const filtroTipo = document.getElementById('filtro-tipo');
const filtroValor = document.getElementById('filtro-valor');
const btnBuscarClientes = document.getElementById('btn-buscar-clientes');
const tabelaClientes = document.getElementById('tabela-clientes');

function filtrarClientes() {
  if (!filtroTipo || !filtroValor || !tabelaClientes) {
    return;
  }

  const tipo = filtroTipo.value;
  const termo = filtroValor.value.trim().toLowerCase();
  const linhas = tabelaClientes.querySelectorAll('tbody tr');

  linhas.forEach((linha) => {
    const valorComparacao = (linha.dataset[tipo] || '').toLowerCase();
    const deveExibir = termo === '' || valorComparacao.includes(termo);
    linha.hidden = !deveExibir;
  });

  const descricaoBusca = termo ? `Filtro aplicado para ${tipo}: ${filtroValor.value}.` : 'Filtro de clientes removido.';
  anunciarStatus(descricaoBusca);
}

if (btnBuscarClientes) {
  btnBuscarClientes.addEventListener('click', filtrarClientes);
}

if (filtroValor) {
  filtroValor.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      filtrarClientes();
    }
  });
}
