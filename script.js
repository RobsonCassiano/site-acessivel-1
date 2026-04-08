let estadoContraste = false;

const btnContraste = document.getElementById("btn-contraste");
const btnAumentar = document.getElementById("btn-aumentar");
const btnDiminuir = document.getElementById("btn-diminuir");
const root = document.documentElement;
const statusAcessibilidade = document.getElementById("acessibilidade-status");
const chaveClientes = "clientesCadastrados";
const chaveUltimoCodigo = "clientesUltimoCodigo";

const campoTelefone = document.getElementById("telefone");
const campoCpf = document.getElementById("cpf");
const campoNascimento = document.getElementById("nascimento");

const passoFonte = 2;
const maxFontSize = 30;
const minFontSize = 12;

let fontSizeAtual = 16;

function obterClientesSalvos() {
  try {
    const conteudo = localStorage.getItem(chaveClientes);
    return conteudo ? JSON.parse(conteudo) : [];
  } catch (error) {
    return [];
  }
}

function salvarClientes(clientes) {
  localStorage.setItem(chaveClientes, JSON.stringify(clientes));
}

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

function obterProximoCodigo() {
  const ultimoCodigoSalvo = Number.parseInt(localStorage.getItem(chaveUltimoCodigo) || "7", 10);
  const proximoCodigo = Number.isNaN(ultimoCodigoSalvo) ? 8 : ultimoCodigoSalvo + 1;
  localStorage.setItem(chaveUltimoCodigo, String(proximoCodigo));
  return String(proximoCodigo).padStart(6, "0");
}

function obterRotuloAssunto(valor) {
  return mapaAssuntos[valor] || valor || "";
}

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

  formulario.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!formulario.reportValidity()) {
      anunciarStatus("Revise os campos obrigatórios antes de enviar.");
      return;
    }

    const dadosFormulario = new FormData(formulario);
    const codigo = obterProximoCodigo();
    const cliente = {
      codigo,
      nome: dadosFormulario.get('nome')?.toString().trim() || '',
      email: dadosFormulario.get('email')?.toString().trim() || '',
      telefone: dadosFormulario.get('telefone')?.toString().trim() || '',
      cpf: dadosFormulario.get('cpf')?.toString().trim() || '',
      nascimento: dadosFormulario.get('nascimento')?.toString().trim() || '',
      sexo: dadosFormulario.get('sexo')?.toString().trim() || 'Não informado',
      canal: dadosFormulario.get('contato')?.toString().trim() || '',
      assuntoValor: dadosFormulario.get('assunto')?.toString().trim() || '',
      assunto: obterRotuloAssunto(dadosFormulario.get('assunto')?.toString().trim() || ''),
      anexos: String(document.querySelectorAll('#lista-arquivos .file-item').length || document.getElementById('anexos')?.files?.length || 0),
      consentimento: dadosFormulario.get('lgpd') ? 'Confirmado' : 'Pendente',
      observacoes: dadosFormulario.get('observacoes')?.toString().trim() || 'Sem observações.',
      novidades: Boolean(dadosFormulario.get('novidades'))
    };

    const clientesSalvos = obterClientesSalvos();
    clientesSalvos.unshift(cliente);
    salvarClientes(clientesSalvos);
    localStorage.setItem('clienteSelecionadoCodigo', codigo);

    anunciarStatus(`Cadastro de ${cliente.nome} enviado com sucesso.`);
    window.location.href = 'tabela.html';
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

if (btnConfirmarWhatsapp && inputWhatsappCustom && modalWhatsapp) {
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
}

if (btnCancelarWhatsapp && modalWhatsapp) {
btnCancelarWhatsapp.addEventListener('click', () => {
  modalWhatsapp.hidden = true;
  // Reverte para o último método de contato válido
  const anterior = document.querySelector(`input[name="contato"][value="${ultimoMetodoContato}"]`);
  if (anterior) anterior.checked = true;
});
}

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
  if (!listaArquivos) {
    return;
  }

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
const filtroAssunto = document.getElementById('filtro-assunto');
const btnBuscarClientes = document.getElementById('btn-buscar-clientes');
const tabelaClientes = document.getElementById('tabela-clientes');
const btnRemoverCliente = document.getElementById('btn-remover-cliente');
const btnMalaDireta = document.getElementById('btn-mala-direta');
const btnRelatorioClientes = document.getElementById('btn-relatorio-clientes');
const codigoAtual = document.querySelector('.legacy-code');
const mapaAssuntos = {
  agendamento: 'Agendamento de consultas',
  exames: 'Resultados de exames',
  internacao: 'Informações sobre internação',
  urgencia: 'Pronto-atendimento / Urgência',
  ouvidoria: 'Sugestões ou reclamações'
};

const camposResumoTabela = {
  codigo: document.getElementById('resultado-codigo'),
  nome: document.getElementById('resultado-nome'),
  assunto: document.getElementById('resultado-assunto'),
  emailResumo: document.getElementById('resultado-email'),
  telefoneResumo: document.getElementById('resultado-telefone'),
  cpfResumo: document.getElementById('resultado-cpf'),
  email: document.getElementById('email-cliente'),
  telefone: document.getElementById('telefone-cliente'),
  cpf: document.getElementById('cpf-cliente'),
  nascimento: document.getElementById('nascimento-cliente'),
  sexo: document.getElementById('sexo-cliente'),
  canal: document.getElementById('canal-preferido'),
  anexos: document.getElementById('anexos-enviados'),
  status: document.getElementById('status-cadastro'),
  observacoes: document.querySelector('.legacy-notes .table-note')
};

function criarLinhaCliente(cliente) {
  const linha = document.createElement('tr');
  linha.dataset.codigo = cliente.codigo || '';
  linha.dataset.assunto = `${cliente.assuntoValor || ''} ${cliente.assunto || ''}`.trim();
  linha.dataset.cliente = JSON.stringify(cliente);

  linha.innerHTML = `
    <td>${cliente.codigo || ''}</td>
    <th scope="row">${cliente.nome || ''}</th>
    <td>${cliente.email || ''}</td>
    <td>${cliente.telefone || ''}</td>
    <td>${cliente.cpf || ''}</td>
    <td>${cliente.canal || ''}</td>
    <td>${cliente.assunto || ''}</td>
    <td>${cliente.anexos || '0'} arquivo(s)</td>
    <td><span class="status-badge ${cliente.consentimento === 'Confirmado' ? 'status-ok' : 'status-warn'}">${cliente.consentimento || 'Pendente'}</span></td>
  `;

  return linha;
}

function carregarClientesSalvosNaTabela() {
  if (!tabelaClientes) {
    return;
  }

  const corpoTabela = tabelaClientes.querySelector('tbody');
  if (!corpoTabela) {
    return;
  }

  corpoTabela.querySelectorAll('tr[data-origem="localStorage"]').forEach((linha) => linha.remove());

  const clientesSalvos = obterClientesSalvos();
  clientesSalvos.slice().reverse().forEach((cliente) => {
    const linha = criarLinhaCliente(cliente);
    linha.dataset.origem = 'localStorage';
    corpoTabela.prepend(linha);
  });
}

function normalizarTexto(valor) {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function obterLinhasClientes() {
  if (!tabelaClientes) {
    return [];
  }

  return Array.from(tabelaClientes.querySelectorAll('tbody tr'));
}

function obterDadosLinha(linha) {
  const celulas = linha.querySelectorAll('td, th');
  let dadosSalvos = null;

  if (linha.dataset.cliente) {
    try {
      dadosSalvos = JSON.parse(linha.dataset.cliente);
    } catch (error) {
      dadosSalvos = null;
    }
  }

  return {
    codigo: dadosSalvos?.codigo || celulas[0]?.textContent.trim() || '',
    nome: dadosSalvos?.nome || celulas[1]?.textContent.trim() || '',
    email: dadosSalvos?.email || celulas[2]?.textContent.trim() || '',
    telefone: dadosSalvos?.telefone || celulas[3]?.textContent.trim() || '',
    cpf: dadosSalvos?.cpf || celulas[4]?.textContent.trim() || '',
    canal: dadosSalvos?.canal || celulas[5]?.textContent.trim() || '',
    assunto: dadosSalvos?.assunto || celulas[6]?.textContent.trim() || '',
    assuntoValor: dadosSalvos?.assuntoValor || '',
    anexos: dadosSalvos?.anexos || celulas[7]?.textContent.trim() || '',
    consentimento: dadosSalvos?.consentimento || celulas[8]?.textContent.trim() || '',
    nascimento: dadosSalvos?.nascimento || '',
    sexo: dadosSalvos?.sexo || '',
    observacoes: dadosSalvos?.observacoes || '',
    novidades: dadosSalvos?.novidades || false
  };
}

function obterTermosBuscaAssunto(termo) {
  const termos = new Set([termo]);

  Object.entries(mapaAssuntos).forEach(([valorFormulario, rotuloTabela]) => {
    const valorNormalizado = normalizarTexto(valorFormulario);
    const rotuloNormalizado = normalizarTexto(rotuloTabela);

    if (termo === valorNormalizado || termo === rotuloNormalizado) {
      termos.add(valorNormalizado);
      termos.add(rotuloNormalizado);
    }
  });

  return Array.from(termos);
}

function atualizarCamposBusca() {
  if (!filtroTipo || !filtroValor || !filtroAssunto) {
    return;
  }

  const buscaPorAssunto = filtroTipo.value === 'assunto';
  filtroValor.hidden = buscaPorAssunto;
  filtroAssunto.hidden = !buscaPorAssunto;

  if (buscaPorAssunto) {
    filtroValor.value = '';
    filtroAssunto.focus();
  } else {
    filtroAssunto.value = '';
    filtroValor.focus();
  }
}

function preencherPainelCliente(dados) {
  if (codigoAtual) {
    codigoAtual.textContent = dados.codigo || '---';
  }

  if (camposResumoTabela.codigo) {
    camposResumoTabela.codigo.textContent = dados.codigo || '---';
  }

  if (camposResumoTabela.nome) {
    camposResumoTabela.nome.textContent = dados.nome || 'Nenhum cliente selecionado';
  }

  if (camposResumoTabela.assunto) {
    camposResumoTabela.assunto.textContent = dados.assunto || '---';
  }

  if (camposResumoTabela.emailResumo) {
    camposResumoTabela.emailResumo.textContent = dados.email || '---';
  }

  if (camposResumoTabela.telefoneResumo) {
    camposResumoTabela.telefoneResumo.textContent = dados.telefone || '---';
  }

  if (camposResumoTabela.cpfResumo) {
    camposResumoTabela.cpfResumo.textContent = dados.cpf || '---';
  }

  if (camposResumoTabela.email) {
    camposResumoTabela.email.value = dados.email || '';
  }

  if (camposResumoTabela.telefone) {
    camposResumoTabela.telefone.value = dados.telefone || '';
  }

  if (camposResumoTabela.cpf) {
    camposResumoTabela.cpf.value = dados.cpf || '';
  }

  if (camposResumoTabela.canal) {
    camposResumoTabela.canal.value = dados.canal || '';
  }

  if (camposResumoTabela.anexos) {
    camposResumoTabela.anexos.value = dados.anexos || '';
  }

  if (camposResumoTabela.status) {
    camposResumoTabela.status.value = dados.consentimento || '';
  }

  if (camposResumoTabela.nascimento) {
    camposResumoTabela.nascimento.value = dados.nascimento || '';
  }

  if (camposResumoTabela.sexo) {
    camposResumoTabela.sexo.value = dados.sexo || '';
  }

  if (camposResumoTabela.observacoes && dados.nome) {
    camposResumoTabela.observacoes.textContent = dados.observacoes || `${dados.nome} está com o assunto "${dados.assunto}" e status "${dados.consentimento}".`;
  }
}

function selecionarLinhaCliente(linha, anunciar = true) {
  const linhas = obterLinhasClientes();

  linhas.forEach((item) => {
    item.classList.remove('is-selected');
    item.removeAttribute('aria-selected');
  });

  if (!linha) {
    preencherPainelCliente({});
    return;
  }

  linha.classList.add('is-selected');
  linha.setAttribute('aria-selected', 'true');
  preencherPainelCliente(obterDadosLinha(linha));

  if (anunciar) {
    const dados = obterDadosLinha(linha);
    anunciarStatus(`Cliente ${dados.nome} selecionado.`);
  }
}

function obterLinhaSelecionada() {
  return tabelaClientes?.querySelector('tbody tr.is-selected') || null;
}

function obterLinhasVisiveis() {
  return obterLinhasClientes().filter((linha) => !linha.hidden);
}

function obterValorBuscaLinha(linha, tipo) {
  const dados = obterDadosLinha(linha);

  if (tipo === 'codigo') {
    return normalizarTexto(`${linha.dataset.codigo || ''} ${dados.codigo || ''}`);
  }

  if (tipo === 'assunto') {
    return normalizarTexto(`${linha.dataset.assunto || ''} ${dados.assuntoValor || ''} ${dados.assunto || ''}`);
  }

  return '';
}

function configurarLinhasClientes() {
  obterLinhasClientes().forEach((linha) => {
    linha.tabIndex = 0;

    if (linha.dataset.eventosConfigurados === 'true') {
      return;
    }

    linha.dataset.eventosConfigurados = 'true';

    linha.addEventListener('click', () => {
      selecionarLinhaCliente(linha);
    });

    linha.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selecionarLinhaCliente(linha);
      }
    });
  });
}

function filtrarClientes() {
  if (!filtroTipo || !filtroValor || !tabelaClientes) {
    return;
  }

  const tipo = filtroTipo.value;
  const valorDigitado = tipo === 'assunto' && filtroAssunto ? filtroAssunto.value : filtroValor.value.trim();
  const termo = normalizarTexto(valorDigitado);
  const linhas = obterLinhasClientes();
  const termosAssunto = tipo === 'assunto' ? obterTermosBuscaAssunto(termo) : [termo];

  linhas.forEach((linha) => {
    const valorComparacao = obterValorBuscaLinha(linha, tipo);
    const deveExibir = termo === ''
      || termosAssunto.some((item) => valorComparacao.includes(item));
    linha.hidden = !deveExibir;
  });

  const linhasVisiveis = obterLinhasVisiveis();
  const primeiraLinha = linhasVisiveis[0] || null;
  selecionarLinhaCliente(primeiraLinha, false);

  const descricaoBusca = termo
    ? `${linhasVisiveis.length} cliente(s) encontrado(s) para ${tipo}: ${valorDigitado}.`
    : 'Filtro de clientes removido.';
  anunciarStatus(descricaoBusca);

  if (primeiraLinha) {
    primeiraLinha.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
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

if (filtroAssunto) {
  filtroAssunto.addEventListener('change', filtrarClientes);
}

if (filtroTipo) {
  filtroTipo.addEventListener('change', atualizarCamposBusca);
  atualizarCamposBusca();
}

carregarClientesSalvosNaTabela();
configurarLinhasClientes();

const codigoSelecionado = localStorage.getItem('clienteSelecionadoCodigo');
const linhaSelecionadaInicial = codigoSelecionado
  ? tabelaClientes?.querySelector(`tbody tr[data-codigo="${codigoSelecionado}"]`)
  : obterLinhasClientes()[0];

if (linhaSelecionadaInicial) {
  selecionarLinhaCliente(linhaSelecionadaInicial, false);
}

if (codigoSelecionado) {
  localStorage.removeItem('clienteSelecionadoCodigo');
}

if (btnRemoverCliente) {
  btnRemoverCliente.addEventListener('click', () => {
    const linhaSelecionada = obterLinhaSelecionada();

    if (!linhaSelecionada) {
      anunciarStatus('Selecione um cliente antes de remover.');
      return;
    }

    const dados = obterDadosLinha(linhaSelecionada);
    linhaSelecionada.remove();
    salvarClientes(obterClientesSalvos().filter((cliente) => cliente.codigo !== dados.codigo));

    const proximaLinha = obterLinhasVisiveis()[0] || obterLinhasClientes()[0] || null;
    selecionarLinhaCliente(proximaLinha, false);
    anunciarStatus(`Cliente ${dados.nome} removido da tabela.`);
  });
}

if (btnMalaDireta) {
  btnMalaDireta.addEventListener('click', async () => {
    const linhasVisiveis = obterLinhasVisiveis();

    if (linhasVisiveis.length === 0) {
      anunciarStatus('Nenhum cliente disponível para gerar mala direta.');
      return;
    }

    const conteudo = linhasVisiveis
      .map((linha) => {
        const dados = obterDadosLinha(linha);
        return `${dados.nome} <${dados.email}>`;
      })
      .join('\n');

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(conteudo);
        anunciarStatus('Mala direta copiada para a área de transferência.');
        return;
      } catch (error) {
        // Segue para o fallback com alert.
      }
    }

    window.alert(`Mala direta gerada:\n\n${conteudo}`);
    anunciarStatus('Mala direta exibida na tela.');
  });
}

if (btnRelatorioClientes) {
  btnRelatorioClientes.addEventListener('click', () => {
    const linhasVisiveis = obterLinhasVisiveis();

    if (linhasVisiveis.length === 0) {
      anunciarStatus('Nenhum cliente disponível para gerar relatório.');
      return;
    }

    const relatorio = linhasVisiveis
      .map((linha) => {
        const dados = obterDadosLinha(linha);
        return `Código: ${dados.codigo}\nNome: ${dados.nome}\nE-mail: ${dados.email}\nTelefone: ${dados.telefone}\nCanal: ${dados.canal}\nAssunto: ${dados.assunto}\nStatus: ${dados.consentimento}`;
      })
      .join('\n\n');

    const blob = new Blob([relatorio], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'relatorio-clientes.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    anunciarStatus('Relatório de clientes gerado com sucesso.');
  });
}
