<<<<<<< HEAD
# 🛡️ Sentinel - Dashboard de Erros n8n

Dashboard em tempo real para monitoramento e gerenciamento de erros do n8n, com notificações push, sistema de perfil e tutorial interativo.

![Dashboard Preview](https://via.placeholder.com/800x400?text=Dashboard+Preview)

## ✨ Funcionalidades

### 📊 Monitoramento em Tempo Real
- **KPIs Visuais**: Métricas de erros abertos, tempo médio de resolução, erros críticos
- **Tabela Interativa**: Lista completa de erros com filtros avançados
- **Busca Inteligente**: Pesquisa por workflow, nó ou mensagem de erro
- **Agrupamento**: Agrupa erros similares automaticamente

### 🔔 Notificações
- **Notificações Push do Chrome**: Alertas mesmo com navegador minimizado
- **Som de Alerta**: Notificação sonora para novos erros
- **Centro de Notificações**: Histórico persistente de alertas
- **Service Worker**: Notificações funcionam mesmo com aba inativa

### 👤 Sistema de Perfil
- **Avatar Customizável**: Upload de foto de perfil
- **Edição de Dados**: Nome completo e informações pessoais
- **Supabase Storage**: Armazenamento seguro de imagens
- **RLS (Row Level Security)**: Políticas de segurança por usuário

### 🎓 Tutorial Interativo
- **Onboarding Automático**: Tour guiado no primeiro acesso
- **7 Passos Educativos**: Explica todas as funcionalidades principais
- **Auto-Reset**: Reaparece a cada 20 dias para reengajamento
- **Controles Completos**: Navegação, skip, e tecla ESC

### 🎨 Interface Premium
- **Design Dark**: Tema escuro moderno e elegante
- **Animações Suaves**: Transições e micro-interações
- **Responsivo**: Funciona em desktop, tablet e mobile
- **Glassmorphism**: Efeitos de vidro e blur

## 🚀 Tecnologias

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + Custom CSS
- **Backend**: Supabase (PostgreSQL + Realtime + Storage + Auth)
- **Notificações**: Service Worker + Notification API
- **Tour**: React Joyride
- **Ícones**: Lucide React
- **Fontes**: Inter + JetBrains Mono

## 📦 Instalação

### Pré-requisitos
- Node.js 18+
- pnpm (ou npm/yarn)
- Conta no Supabase

### 1. Clonar o repositório
```bash
git clone https://github.com/SEU_USUARIO/sentinel-dashboard.git
cd sentinel-dashboard
```

### 2. Instalar dependências
```bash
pnpm install
```

### 3. Configurar Supabase

#### 3.1. Criar projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Copie a **URL** e **anon key**

#### 3.2. Configurar variáveis de ambiente
Crie um arquivo `.env.local`:

```env
VITE_SUPABASE_URL=sua_url_aqui
VITE_SUPABASE_ANON_KEY=sua_key_aqui
```

#### 3.3. Executar migrations
Execute os comandos SQL no SQL Editor do Supabase:

**Tabela de erros:**
```sql
create table public.errors (
  id uuid default gen_random_uuid() primary key,
  message text not null,
  status text default 'pendente',
  priority text default 'Média',
  severity text default 'média',
  timestamp timestamptz default now(),
  "workflowName" text,
  "workflowId" text
);

-- RLS
alter table public.errors enable row level security;

create policy "Allow all operations for authenticated users"
  on public.errors
  for all
  using (auth.role() = 'authenticated');
```

**Tabela de perfis:**
```sql
create table public.user_profiles (
  id uuid references auth.users primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS
alter table public.user_profiles enable row level security;

create policy "Users can view own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.user_profiles for insert
  with check (auth.uid() = id);
```

**Storage bucket para avatars:**
```sql
-- Criar bucket 'avatars' no Supabase Storage UI
-- Depois executar:
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Anyone can upload an avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars');

create policy "Anyone can update own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars');
```

### 4. Executar em desenvolvimento
```bash
pnpm run dev
```

Acesse: http://localhost:3000

### 5. Build para produção
```bash
pnpm run build
pnpm run preview
```

## 📱 Configurar Notificações Push

### 1. Permitir notificações no navegador
Quando solicitado, clique em **"Permitir"**

### 2. Service Worker
O service worker é registrado automaticamente. Verifique em:
- Chrome DevTools → Application → Service Workers

### 3. Testar notificações
1. Faça login no dashboard
2. Insira um erro de teste no Supabase
3. Notificação deve aparecer automaticamente

## 🎯 Como Usar

### Login
1. Acesse o dashboard
2. Faça login com suas credenciais do Supabase Auth
3. Tour interativo inicia automaticamente no primeiro acesso

### Monitorar Erros
1. **KPIs**: Visualize métricas em tempo real no topo
2. **Filtros**: Use os filtros de status, prioridade e período
3. **Busca**: Digite palavras-chave para encontrar erros específicos
4. **Detalhes**: Clique em qualquer linha para ver detalhes completos

### Gerenciar Perfil
1. Clique no avatar no canto superior direito
2. Selecione "Editar Perfil"
3. Faça upload de uma foto ou edite seu nome
4. Clique em "Salvar"

### Reiniciar Tutorial
```javascript
// No console do navegador (F12):
localStorage.removeItem('sentinel_tour_completed');
// Recarregue a página
```

## 🔧 Configurações

### Alterar período do tour (padrão: 20 dias)
```typescript
// hooks/useTourStatus.ts
const TOUR_RESET_DAYS = 20; // Alterar para o número desejado
```

### Personalizar cores do tema
```typescript
// components/OnboardingTour.tsx
styles: {
  options: {
    primaryColor: '#3b82f6', // Alterar aqui
  }
}
```

## 📁 Estrutura do Projeto

```
dashboard-de-erros-n8n/
├── src/
│   ├── components/
│   │   ├── LoginPage.tsx
│   │   ├── OnboardingTour.tsx
│   │   ├── ProfileDropdown.tsx
│   │   ├── ProfileModal.tsx
│   │   └── Toast.tsx
│   ├── config/
│   │   └── tourSteps.ts
│   ├── hooks/
│   │   ├── useAlerts.ts
│   │   ├── useAuth.ts
│   │   ├── useProfile.ts
│   │   └── useTourStatus.ts
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── notifications.ts
│   │   ├── security.ts
│   │   └── supabase.ts
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
├── public/
│   ├── sw.js (Service Worker)
│   └── notification.mp3
├── .env.local
├── .gitignore
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🐛 Troubleshooting

### Notificações não funcionam
1. Verificar se o navegador suporta Notification API
2. Verificar permissões no navegador
3. Verificar se service worker está ativo (DevTools)

### Tour não aparece
1. Limpar localStorage: `localStorage.removeItem('sentinel_tour_completed')`
2. Verificar se está logado
3. Verificar console para erros

### Erros não aparecem no dashboard
1. Verificar RLS policies no Supabase
2. Verificar se está autenticado
3. Verificar console para erros de conexão

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.

## 👤 Autor

**Seu Nome**
- GitHub: [@seu-usuario](https://github.com/seu-usuario)

## 🙏 Agradecimentos

- [Supabase](https://supabase.com) - Backend as a Service
- [React Joyride](https://react-joyride.com) - Tour interativo
- [Lucide](https://lucide.dev) - Ícones
- [Tailwind CSS](https://tailwindcss.com) - Styling
=======
# Sentinel
>>>>>>> c3b480e508e307f43a7a09de2bcc48f1ff816dd9
