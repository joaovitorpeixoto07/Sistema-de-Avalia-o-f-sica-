const readline = require('node:readline/promises');
const { stdin, stdout } = require('node:process');

const NIVEIS_ATIVIDADE = ['Alto', 'Moderado', 'Baixo'];

function validarDados(aluno) {
	const erros = [];

	if (!aluno.nome || aluno.nome.trim().length < 2) {
		erros.push('informe um nome valido');
	}
	if (!Number.isFinite(aluno.idade) || aluno.idade <= 0 || aluno.idade > 120) {
		erros.push('a idade deve estar entre 1 e 120 anos');
	}
	if (!aluno.genero || aluno.genero.trim().length === 0) {
		erros.push('informe o genero');
	}
	if (!Number.isFinite(aluno.peso) || aluno.peso <= 0) {
		erros.push('o peso deve ser maior que zero');
	}
	if (!Number.isFinite(aluno.altura) || aluno.altura <= 0 || aluno.altura > 3) {
		erros.push('a altura deve estar entre 0 e 3 metros');
	}
	if (!NIVEIS_ATIVIDADE.includes(aluno.atividade)) {
		erros.push('o nivel de atividade deve ser Alto, Moderado ou Baixo');
	}

	return erros;
}

function calcularImc(peso, altura) {
	return peso / (altura * altura);
}

function classificarCondicao(imc, atividade) {
	if (imc >= 18.5 && imc <= 24.9 && atividade === 'Alto') {
		return 'Excelente';
	}

	if (imc >= 18.5 && imc <= 24.9 && atividade === 'Moderado') {
		return 'Bom';
	}

	if ((imc >= 18.5 && imc <= 29.9 && atividade === 'Baixo') || atividade === 'Baixo') {
		return 'Regular';
	}

	return 'Atencao';
}

function obterOrientacao(categoria) {
	const orientacoes = {
		Excelente: 'Parabens! Seu condicionamento esta excelente!',
		Bom: 'Muito bom! Continue mantendo bons habitos!',
		Regular: 'Sua condicao fisica pode melhorar. Tente ser mais ativo!',
		Atencao: 'Busque orientacao profissional e cuide da sua saude.'
	};

	return orientacoes[categoria];
}

function avaliarAluno(aluno) {
	const erros = validarDados(aluno);
	if (erros.length > 0) {
		return { valido: false, erros };
	}

	const imc = calcularImc(aluno.peso, aluno.altura);
	const categoria = classificarCondicao(imc, aluno.atividade);

	return {
		valido: true,
		nome: aluno.nome.trim(),
		imc: Number(imc.toFixed(2)),
		categoria,
		mensagem: obterOrientacao(categoria)
	};
}

async function perguntarDados() {
	const interfaceTerminal = readline.createInterface({ input: stdin, output: stdout });

	try {
		const aluno = {
			nome: await interfaceTerminal.question('Nome do aluno: '),
			idade: Number(await interfaceTerminal.question('Idade: ')),
			genero: await interfaceTerminal.question('Genero: '),
			peso: Number((await interfaceTerminal.question('Peso em kg: ')).replace(',', '.')),
			altura: Number((await interfaceTerminal.question('Altura em metros: ')).replace(',', '.')),
			atividade: await interfaceTerminal.question('Nivel de atividade (Alto, Moderado ou Baixo): ')
		};

		const resultado = avaliarAluno(aluno);

		if (!resultado.valido) {
			console.log('\nDados invalidos:');
			resultado.erros.forEach(erro => console.log(`- ${erro}`));
			return;
		}

		console.log('\nResultado da avaliacao');
		console.log(`Aluno: ${resultado.nome}`);
		console.log(`IMC: ${resultado.imc}`);
		console.log(`Categoria: ${resultado.categoria}`);
		console.log(resultado.mensagem);
	} finally {
		interfaceTerminal.close();
	}
}

if (require.main === module) {
	perguntarDados();
}

module.exports = {
	avaliarAluno,
	calcularImc,
	classificarCondicao,
	obterOrientacao,
	validarDados
};
