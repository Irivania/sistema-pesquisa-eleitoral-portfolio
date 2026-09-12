import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xofzpvtgfvjoymeahisx.supabase.co';
const supabaseKey = 'sb_publishable_cdqC8TQ7OojKdwt3X1TS-g_npkC_XCx'; // Coloque sua chave anon real aqui

const supabase = createClient(supabaseUrl, supabaseKey);

async function testeDeEstresse(totalEntrevistas = 20) {
  console.log(`[TESTE DE TERMINAL] Iniciando disparo de ${totalEntrevistas} entrevistas simultâneas...`);
  
  const inicio = Date.now();
  const bairros = ['Centro', 'Severino Afonso', 'Halcic', 'Centenário', 'São Cristovão'];
  
  const promessas = [];

  for (let i = 1; i <= totalEntrevistas; i++) {
    const dados = {
      interviewer_name: `Entrevistador Robô ${i}`,
      bairro: bairros[Math.floor(Math.random() * bairros.length)],
      area: 'Urbana',
      sexo: 'Feminino',
      faixa_etaria: '35-44 anos',
      escolaridade: 'Superior Completo',
      aval_prefeta: 'Regular',
      aval_governadora: 'Boa',
      problema_principal: 'Segurança',
      rodada: 'rodada_1',
      created_at: new Date().toISOString()
    };

    // Cria a promessa de inserção assíncrona
    promessas.push(supabase.from('surveys').insert([dados]));
  }

  // Executa todas as inserções juntas para testar a performance da API
  const resultados = await Promise.all(promessas);
  const fim = Date.now();

  const erros = resultados.filter(r => r.error);
  
  console.log('----------------------------------------');
  console.log(`[RESULTADO] Teste finalizado em ${fim - inicio}ms`);
  console.log(`Total enviado: ${totalEntrevistas}`);
  console.log(`Sucessos: ${totalEntrevistas - erros.length}`);
  console.log(`Erros: ${erros.length}`);
  console.log('----------------------------------------');
}

testeDeEstresse(20);