-- Execute este script no SQL Editor do Supabase para habilitar Realtime

-- 1. Habilita REPLICA IDENTITY FULL (necessário para Realtime funcionar)
ALTER TABLE errors REPLICA IDENTITY FULL;

-- 2. Verifica se está habilitado
SELECT relname, relreplident 
FROM pg_class 
WHERE relname = 'errors';
-- Deve retornar 'f' (FULL) na coluna relreplident

-- 3. Habilita Realtime no Supabase Dashboard
-- Vá em: Database > Replication > Habilite a tabela 'errors'
