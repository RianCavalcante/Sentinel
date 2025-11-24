# Opções de Segurança para o Dashboard

Este documento detalha as diferentes opções para proteger o dashboard de erros n8n.

---

## 1. Autenticação Simples com Senha

### Como Funciona
- Tela de login com senha única
- Senha armazenada em variável de ambiente
- Session storage para manter usuário logado

### Prós
- ✅ Simples de implementar
- ✅ Não requer configuração adicional no Supabase
- ✅ Ideal para uso pessoal ou pequenas equipes

### Contras
- ❌ Senha compartilhada entre todos
- ❌ Sem controle de usuários individuais
- ❌ Sem recuperação de senha

### Implementação
```typescript
// .env
VITE_DASHBOARD_PASSWORD=sua_senha_segura

// Login.tsx
const handleLogin = (password: string) => {
  if (password === import.meta.env.VITE_DASHBOARD_PASSWORD) {
    sessionStorage.setItem('authenticated', 'true');
    navigate('/');
  }
};
```

---

## 2. Autenticação com Supabase Auth (Recomendado)

### Como Funciona
- Sistema completo de autenticação do Supabase
- Login com email/senha
- Gerenciamento de usuários no dashboard do Supabase
- Tokens JWT seguros

### Prós
- ✅ Segurança profissional
- ✅ Múltiplos usuários com emails únicos
- ✅ Recuperação de senha automática
- ✅ Suporte a 2FA (autenticação de dois fatores)
- ✅ Logs de acesso
- ✅ Integração nativa com RLS

### Contras
- ❌ Requer configuração inicial no Supabase
- ❌ Mais complexo que senha simples

### Implementação

#### Passo 1: Configurar no Supabase
1. Acesse **Authentication** no dashboard
2. Habilite **Email Provider**
3. Configure **Site URL** e **Redirect URLs**

#### Passo 2: Criar componentes de autenticação
```typescript
// hooks/useAuth.ts
export const useAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, signIn, signOut, signUp };
};
```

#### Passo 3: Atualizar RLS
```sql
-- Apenas usuários autenticados podem ver alertas
CREATE POLICY "Authenticated users can read errors"
ON errors FOR SELECT
USING (auth.uid() IS NOT NULL);
```

---

## 3. Proteção por IP/Rede

### Como Funciona
- Configurar firewall no Supabase para aceitar apenas IPs específicos
- Útil se você sempre acessa de um local fixo

### Prós
- ✅ Camada adicional de segurança
- ✅ Não requer login
- ✅ Transparente para o usuário

### Contras
- ❌ Não funciona com IP dinâmico
- ❌ Dificulta acesso remoto
- ❌ Requer plano pago do Supabase

### Implementação
1. Acesse **Settings** → **Network Restrictions**
2. Adicione seus IPs permitidos
3. Salve as configurações

---

## 4. Row Level Security (RLS) Avançado

### Como Funciona
- Políticas mais restritivas no banco de dados
- Combina com autenticação para controle granular

### Prós
- ✅ Segurança em nível de banco de dados
- ✅ Controle fino sobre quem vê o quê
- ✅ Funciona mesmo se o frontend for comprometido

### Contras
- ❌ Requer conhecimento de SQL
- ❌ Pode ser complexo para casos avançados

### Implementação
```sql
-- Apenas usuários autenticados podem inserir
CREATE POLICY "Authenticated users can insert errors"
ON errors FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Apenas o criador pode deletar (se você adicionar user_id)
CREATE POLICY "Users can delete own errors"
ON errors FOR DELETE
USING (auth.uid() = user_id);

-- Apenas admins podem limpar histórico
CREATE POLICY "Only admins can delete all"
ON errors FOR DELETE
USING (
  auth.jwt() ->> 'role' = 'admin'
);
```

---

## Comparação Rápida

| Recurso | Senha Simples | Supabase Auth | IP/Rede | RLS Avançado |
|---------|---------------|---------------|---------|--------------|
| Facilidade | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ |
| Segurança | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Múltiplos Usuários | ❌ | ✅ | ❌ | ✅ |
| Recuperação de Senha | ❌ | ✅ | N/A | N/A |
| Custo | Grátis | Grátis | Pago | Grátis |

---

## Recomendação

Para **uso pessoal ou pequenas equipes**:
- **Opção 1** (Senha Simples) + **Opção 4** (RLS básico)

Para **uso profissional ou múltiplos usuários**:
- **Opção 2** (Supabase Auth) + **Opção 4** (RLS avançado)

Para **máxima segurança**:
- **Opção 2** + **Opção 3** + **Opção 4** (todas combinadas)

---

## Próximos Passos

Escolha a opção que melhor se adequa ao seu caso e me avise. Posso implementar qualquer uma delas para você!
