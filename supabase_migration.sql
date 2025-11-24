-- 1. Remove a tabela antiga (CUIDADO: apaga os dados anteriores)
DROP TABLE IF EXISTS errors;

-- 2. Cria a nova tabela focada no Feed
CREATE TABLE errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- O texto da IA vai aqui
  message TEXT NOT NULL, 
  
  -- Nome do Workflow para busca (NOVO)
  workflow_name TEXT,
  
  -- Tags simples
  status TEXT DEFAULT 'Novo',    -- Ex: Novo, Lido, Resolvido
  priority TEXT DEFAULT 'Média', -- Ex: Baixa, Média, Alta, Crítica
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Cria índices
CREATE INDEX idx_errors_created_at ON errors(created_at DESC);
CREATE INDEX idx_errors_workflow_name ON errors(workflow_name);

-- 4. Habilita Realtime (necessário para notificações em tempo real)
ALTER TABLE errors REPLICA IDENTITY FULL;

-- 5. RLS (Segurança)
ALTER TABLE errors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON errors FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON errors FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON errors FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete" ON errors FOR DELETE USING (true);
