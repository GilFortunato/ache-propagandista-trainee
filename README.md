# Programa PcD – Propagandista Trainee

POC independente da experiência Aché para o Programa PcD – Propagandista Trainee.

## Escopo inicial
- Login separado da Home
- Home em formato Nexus
- Módulos: Prosper, Aché, Letramento, Cultura, Vagas, Potenc.IA, Comunidade e ReBrand Pessoal
- Área ADM
- Perfis previstos: participant e admin
- Comunidade baseada em links do YouTube
- Diagnóstico de LinkedIn orientado ao perfil de Propagandista

## Identidade
A Home e o Login seguem majoritariamente a identidade Aché. Páginas Prosper e Potenc.IA terão identidades próprias baseadas nos materiais institucionais aprovados.

> Observação: a POC usa uma representação tipográfica temporária da marca Aché. O asset oficial da logo deve substituir essa representação na próxima etapa.

## Administração das integrações

- A rota /admin exige senha e mantém a sessão em cookie HttpOnly, por até 8 horas.
- Acesse ADM → Integrações e chaves de API para cadastrar, trocar, remover ou testar Manus e Gemini.
- As chaves são mantidas como variáveis criptografadas de produção na Vercel e nunca são devolvidas ao navegador.
- O controle de acesso usa ACHE_ADMIN_PASSWORD_HASH (hash scrypt) e ACHE_ADMIN_SESSION_SECRET.
- Para liberar o gerenciamento pelo painel, defina ACHE_VERCEL_API_TOKEN como variável criptografada de produção, com o menor escopo de permissões possível. ACHE_VERCEL_PROJECT_ID e ACHE_VERCEL_TEAM_ID também devem estar configurados. Faça um único redeploy após essa configuração.
- A API consulta as variáveis de produção da Vercel em tempo real; a troca de chaves depois do setup não exige novo deploy.
- O endpoint Manus requer autenticação Google verificada ou sessão ADM; a pesquisa nunca é pública.
- 3 pesquisas consumidas por conta Google, com controle atômico no Postgres; sessões administrativas e ACHE_OWNER_GOOGLE_EMAIL verificado são ilimitadas.
- Uma pesquisa conta quando uma tarefa Manus é criada. Polling e consulta de resultado não cobram pesquisas extras.
- As demais áreas administrativas ainda são POC.

Não grave chaves em código-fonte, no navegador ou em variáveis NEXT_PUBLIC_*. Nunca reutilize as credenciais de outros projetos.

## Migração Apify → Manus (aguardando configuração da infraestrutura)

O código utiliza `https://api.manus.ai/v2/task.create`, `task.detail` e `task.listMessages` com retorno estruturado. Pesquisas podem demorar minutos e consomem créditos Manus. O Apify antigo não é mais chamado no ReBrand.

**Para habilitar com segurança:**
1. Crie uma API Key em https://manus.im/settings/api e cadastre em ADM → Manus, sem enviar pelo chat. A variável persistida será `ACHE_REBRAND_MANUS_API_KEY`.
2. Configure um OAuth Client Web no Google Cloud Console com o redirect `https://ache-propagandista-trainee.vercel.app/api/auth/google/callback`. Adicione os segredos `ACHE_GOOGLE_CLIENT_ID`, `ACHE_GOOGLE_CLIENT_SECRET`, `ACHE_AUTH_SESSION_SECRET` (aleatório com >=32 caracteres) e `ACHE_GOOGLE_REDIRECT_URI` ao Production na Vercel.
3. Configure `ACHE_OWNER_GOOGLE_EMAIL` com o e-mail Google da proprietária para isenção automática. A sessão de ADM também é sempre isenta do limite.
4. Provisione **um banco Neon próprio para este projeto** na Vercel Storage/Marketplace. Cadastre a string privada em `ACHE_REBRAND_DATABASE_URL` e execute `database/ache_rebrand_manus.sql` no SQL Editor do novo banco. Não compartilhe bancos operacionais de outros clientes.
5. Faça redeploy. Somente depois teste login Google, 3 pesquisas por usuário, bloqueio da 4ª, conta ADM ilimitada, painel de status e um diagnóstico Manus real.

**Fail closed:** sem banco ou Google OAuth, participantes não podem iniciar pesquisas; não há cotas apenas no navegador. Sem chave Manus, nem o ADM pode iniciar pesquisa paga. Não é possível afirmar que tarefas reais funcionam antes de cadastrar e testar a API Key.

**Proteção de dados:** pesquisa apenas informações profissionais públicas mediante aceite explícito, resultados privados por usuário, e perfil não pontuado sem evidências do LinkedIn. Configure retenção e exclusão dos resultados conforme a política de privacidade do programa.
