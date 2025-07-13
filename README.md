API e Frontend de Gerenciamento de Tarefas
Este é um projeto completo de gerenciamento de tarefas (To-Do List) que inclui uma API RESTful robusta desenvolvida com Node.js e Express, utilizando PostgreSQL como banco de dados, e um frontend interativo construído com HTML, CSS (Tailwind CSS) e JavaScript puro.

O objetivo deste projeto é demonstrar habilidades em desenvolvimento Fullstack, cobrindo desde a configuração do ambiente, modelagem de dados, autenticação, operações CRUD, até a criação de uma interface de usuário responsiva e animada.

Funcionalidades
Backend (API)
Autenticação de Usuários: Registro e Login com JSON Web Tokens (JWT) para segurança.

Gerenciamento de Tarefas (CRUD):

Criar novas tarefas.

Listar todas as tarefas do usuário autenticado.

Visualizar detalhes de uma tarefa específica.

Atualizar tarefas existentes.

Deletar tarefas.

Filtragem de Tarefas: Filtrar por status (pendente, concluída).

Pesquisa de Tarefas: Buscar tarefas por palavras-chave no título ou descrição.

Paginação: Retorna um número limitado de tarefas por requisição, com controle de página e limite.

Validação de Dados: Validação de entrada para garantir a integridade dos dados.

Tratamento de Erros: Middleware centralizado para lidar com erros de forma consistente.

CORS: Configurado para permitir comunicação com o frontend.

Rate Limiting: Proteção contra abusos e ataques de força bruta.

Frontend
Autenticação: Interface para registro e login de usuários.

Gerenciamento de Tarefas: Formulários e lista para interagir com as operações CRUD da API.

Filtros e Pesquisa: Interface para filtrar e pesquisar tarefas.

Paginação: Navegação entre as páginas de tarefas.

Modo Claro/Escuro: Alterna o tema visual da aplicação.

Menu Lateral (Sidebar): Menu colapsável para navegação.

Responsividade: Design adaptável para diferentes tamanhos de tela (desktop, tablet, mobile).

Animações: Utiliza GSAP para transições suaves (ex: sidebar) e AOS para animações de elementos ao rolar.

Estética: Design limpo e moderno, inspirado em ferramentas como Microsoft To Do e Notion.

Tecnologias Utilizadas
Backend
Node.js: Ambiente de execução JavaScript.

Express.js: Framework web para Node.js.

PostgreSQL: Banco de dados relacional.

pg: Cliente PostgreSQL para Node.js.

dotenv: Para carregar variáveis de ambiente.

bcryptjs: Para criptografia de senhas.

jsonwebtoken: Para autenticação JWT.

express-validator: Para validação de dados de entrada.

cors: Para Cross-Origin Resource Sharing.

express-rate-limit: Para limitação de taxa de requisições.

nodemon: Para desenvolvimento (reinicia o servidor automaticamente).

Frontend
HTML5: Estrutura da página.

CSS3 (Tailwind CSS): Framework CSS utilitário para estilização e responsividade.

JavaScript (Puro): Lógica da interface e comunicação com a API.

GSAP (GreenSock Animation Platform): Biblioteca para animações de alta performance.

AOS (Animate On Scroll): Biblioteca para animações de elementos ao rolar a página.

Como Rodar o Projeto
Siga os passos abaixo para configurar e rodar o projeto em sua máquina local.

1. Configuração do Backend
Clone o repositório (se estiver em um repositório Git) ou navegue até a pasta raiz do seu projeto backend (TODO-API-BACKEND).

Instale as dependências do Node.js:

npm install

Crie um arquivo .env na raiz da pasta TODO-API-BACKEND com as seguintes variáveis de ambiente, substituindo pelos seus dados do PostgreSQL e uma chave JWT forte:

PORT=3010
DB_USER=seu_usuario_postgres
DB_HOST=localhost
DB_NAME=seu_nome_do_banco
DB_PASSWORD=sua_senha_postgres
DB_PORT=5432
JWT_SECRET=sua_chave_secreta_muito_forte_e_aleatoria_para_jwt

Lembre-se: Não compartilhe seu arquivo .env em repositórios públicos.

Crie as tabelas no seu banco de dados PostgreSQL. Conecte-se ao seu banco de dados e execute as seguintes instruções SQL:

-- Tabela de Usuários
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Tarefas
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- Ex: 'pending', 'completed'
    user_id INTEGER NOT NULL, -- Chave estrangeira para a tabela users
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

Inicie o servidor backend:

npm start

O servidor estará rodando em http://localhost:3010.

2. Configuração e Execução do Frontend
Navegue até a pasta frontend dentro do seu projeto principal (TODO-API-BACKEND/frontend).

Abra o arquivo index.html no seu editor de texto.

Ajuste a URL da API: Localize a linha const API_BASE_URL = 'http://localhost:3010/api'; e certifique-se de que a porta (3010) corresponde à porta em que seu backend está rodando.

Abra o arquivo index.html no seu navegador web. Basta dar um duplo clique no arquivo no explorador de arquivos.

Como Usar a Aplicação
Com o backend e o frontend rodando, abra index.html no seu navegador.

Registro: Na tela inicial, você verá o formulário de autenticação. Clique em "Registre-se" para criar uma nova conta.

Login: Após o registro, faça login com suas credenciais.

Gerenciamento de Tarefas: Uma vez logado, você poderá:

Adicionar Nova Tarefa: Clique no botão "+ Adicionar Nova Tarefa".

Listar Tarefas: Suas tarefas serão exibidas na lista.

Editar Tarefa: Clique no ícone de lápis ao lado de uma tarefa.

Deletar Tarefa: Clique no ícone de lixeira ao lado de uma tarefa.

Filtrar e Pesquisar: Use os campos de filtro de status e pesquisa para encontrar tarefas específicas.

Paginação: Navegue entre as páginas de tarefas usando os botões "Anterior" e "Próxima".

Modo Claro/Escuro: Use o ícone de sol/lua no cabeçalho para alternar o tema da aplicação.

Menu Lateral: Clique no ícone de hambúrguer no canto superior esquerdo para abrir/fechar o menu lateral.

Próximos Passos (Melhorias Potenciais)
Deploy: Colocar a API e o Frontend em produção (ex: Render, Netlify, Vercel).

Testes Automatizados: Implementar testes unitários e de integração para o backend e o frontend.

Notificações/Alertas: Substituir alert() e confirm() por modais de UI mais amigáveis.

Validação Frontend: Adicionar validação de formulário no lado do cliente para uma melhor experiência do usuário.

Recursos Adicionais: Adicionar funcionalidades como prioridade de tarefas, datas de vencimento, categorias, etc.

Otimização de Performance: Implementar caching, otimizar queries de banco de dados.

Autor: Davi Snaider
