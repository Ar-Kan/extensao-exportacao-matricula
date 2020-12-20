'use strict';

const idf_solicitacao = document.querySelector(
  'body > div.content > div > div.form-container > fieldset > div:nth-child(3) > div:nth-child(1) > p > span > b'
);
const identificador_solicitacao = idf_solicitacao
  ? idf_solicitacao.innerText
  : 'solicitacao';

const campo_botoes =
  'body > div.content > div > div.form-container > fieldset > div:nth-child(8) > div > table > tbody > tr > td:nth-child(5)';
const campos = document.querySelectorAll(campo_botoes);

for (let i = 0; i < campos.length; i++) {
  const campo_visualizar = campos[i];
  if (!campo_visualizar.querySelector('button')) {
    /**Não possui botão */
    continue;
  }

  const parent_element = campo_visualizar.parentElement;
  const matricula_imovel = parent_element.querySelector('td:nth-child(3)')
    .innerText;

  const btn_download = document.createElement('button');
  const span_download = document.createElement('span');

  btn_download.setAttribute('class', 'btn btn-bg btn-download');
  btn_download.appendChild(span_download);

  const fn_campo = campo_visualizar
    .querySelector('button')
    .getAttribute('onclick');
  const [servicoId, servicoMatriculaId] = fn_campo.match(/\d+/g);

  btn_download.addEventListener(
    'click',
    function () {
      busca_matricula(servicoId, servicoMatriculaId, matricula_imovel);
    },
    false
  );

  campo_visualizar.appendChild(btn_download);
}

function fn_alert(msg = 'Oops') {
  alert(`${msg}, por favor, contate o adiministrador do sistema`);
}

function busca_matricula(servicoId, servicoMatriculaId, matricula_imovel) {
  if (!servicoId || !servicoMatriculaId) {
    fn_alert('A matrícula não pôde ser localizada');
  }
  const url = '/Entidade/MatriculaOnline/GetMatricula';
  const data = {
    servicoSolicitadoId: servicoId,
    servicoMatriculaId: servicoMatriculaId,
  };

  $.ajax({
    url: url,
    type: 'POST',
    data: data,
    success: function (response) {
      salva_matricula(response, matricula_imovel);
    },
    error: function (err) {
      fn_alert(`Houve um erro ao buscar a matrícula, ${err}`);
    },
  });
}

function salva_matricula(response = '', matricula_imovel = '') {
  if (!matricula_imovel) {
    matricula_imovel = 'matricula';
  }

  const matriculas = response.match(/(?<=img_matricula).*(?=\"\>\<)/gi);
  if (!matriculas) {
    fn_alert('Não foram encontradas matrículas');
  }

  for (let i = 0; i < matriculas.length; i++) {
    const id_matricula = matriculas[i].match(/(?<=id=").*(?=" )/gi);
    const _id = id_matricula ? id_matricula[0].match(/\d+/g) : i;

    const imagem64 = matriculas[i].match(/(?<=url\().*(?=\)\;)/gi);

    if (!imagem64) {
      fn_alert('Não foi possível localizar a imagem da matrícula');
      return;
    }

    exporta_matricula(_id, imagem64[0], matricula_imovel);
  }
}

function exporta_matricula(id, imagem64, matricula_imovel) {
  const link_exportacao = document.createElement('a');
  const nome_arquivo = `${identificador_solicitacao}_-_${matricula_imovel}-${id}`;

  link_exportacao.href = imagem64;
  link_exportacao.download = nome_arquivo;
  link_exportacao.click();
}
