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
- Acesse ADM → Integrações e chaves de API para cadastrar, trocar, remover ou testar Apify e Gemini.
- As chaves são mantidas como variáveis criptografadas de produção na Vercel e nunca são devolvidas ao navegador.
- O controle de acesso usa ACHE_ADMIN_PASSWORD_HASH (hash scrypt) e ACHE_ADMIN_SESSION_SECRET.
- Para liberar o gerenciamento pelo painel, defina ACHE_VERCEL_API_TOKEN como variável criptografada de produção, com o menor escopo de permissões possível. ACHE_VERCEL_PROJECT_ID e ACHE_VERCEL_TEAM_ID também devem estar configurados. Faça um único redeploy após essa configuração.
- A API consulta as variáveis de produção da Vercel em tempo real; a troca de chaves depois do setup não exige novo deploy.
- Até que o login de participantes esteja funcional, o endpoint do diagnóstico do LinkedIn requer autenticação administrativa para não permitir consumo anônimo de provedores pagos.
- As demais áreas administrativas ainda são POC.

Não grave chaves em código-fonte, no navegador ou em variáveis NEXT_PUBLIC_*. Nunca reutilize as credenciais de outros projetos.
