-- ============================================
-- WORDGUESS PRO - CONFIGURACIÓN DE SUPABASE
-- ============================================
-- 
-- Este script crea las tablas necesarias para persistencia en Supabase.
-- NOTA: Esto es OPCIONAL. El juego funciona sin estas tablas usando in-memory state.
-- 
-- Ejecuta este script en: Supabase Dashboard → SQL Editor → New Query

-- ============================================
-- 1. TABLA DE ESTADO DEL JUEGO
-- ============================================

CREATE TABLE IF NOT EXISTS game_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  current_word TEXT,
  current_hint TEXT,
  revealed_indices INTEGER[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT false,
  start_time BIGINT,
  duration INTEGER DEFAULT 180,
  double_points_active BOOLEAN DEFAULT false,
  double_points_until BIGINT,
  winners JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_game_state_active ON game_state(is_active);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_game_state_updated_at BEFORE UPDATE ON game_state
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2. TABLA DE JUGADORES Y RANKING
-- ============================================

CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  points INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para ranking
CREATE INDEX IF NOT EXISTS idx_players_points ON players(points DESC);
CREATE INDEX IF NOT EXISTS idx_players_name ON players(name);

-- Trigger para actualizar last_updated
CREATE TRIGGER update_players_last_updated BEFORE UPDATE ON players
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 3. TABLA DE PALABRAS PERSONALIZADAS
-- ============================================

CREATE TABLE IF NOT EXISTS custom_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL,
  hint TEXT NOT NULL,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  category TEXT,
  times_used INTEGER DEFAULT 0,
  times_guessed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_custom_words_difficulty ON custom_words(difficulty);
CREATE INDEX IF NOT EXISTS idx_custom_words_category ON custom_words(category);

-- Trigger
CREATE TRIGGER update_custom_words_updated_at BEFORE UPDATE ON custom_words
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. TABLA DE HISTORIAL DE JUEGOS
-- ============================================

CREATE TABLE IF NOT EXISTS game_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL,
  hint TEXT,
  winner TEXT,
  winner_points INTEGER,
  duration_seconds INTEGER,
  letters_revealed INTEGER,
  total_guesses INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para analytics
CREATE INDEX IF NOT EXISTS idx_game_history_winner ON game_history(winner);
CREATE INDEX IF NOT EXISTS idx_game_history_ended_at ON game_history(ended_at DESC);

-- ============================================
-- 5. TABLA DE EVENTOS (LOG DE WEBHOOKS)
-- ============================================

CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('guess', 'reveal_letter', 'double_points', 'reveal_all', 'new_round', 'other')),
  sender TEXT NOT NULL,
  data JSONB,
  success BOOLEAN DEFAULT true,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_webhook_events_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_timestamp ON webhook_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_events_sender ON webhook_events(sender);

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE game_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Políticas: Permitir acceso público (para juego embebido)
-- NOTA: En producción, considera restringir según autenticación

-- game_state: Todos pueden leer y escribir
CREATE POLICY "Allow public read access" ON game_state FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON game_state FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON game_state FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON game_state FOR DELETE USING (true);

-- players: Todos pueden leer y escribir
CREATE POLICY "Allow public read access" ON players FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON players FOR UPDATE USING (true);

-- custom_words: Todos pueden leer y escribir
CREATE POLICY "Allow public read access" ON custom_words FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON custom_words FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON custom_words FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON custom_words FOR DELETE USING (true);

-- game_history: Todos pueden leer, solo sistema puede escribir
CREATE POLICY "Allow public read access" ON game_history FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON game_history FOR INSERT WITH CHECK (true);

-- webhook_events: Solo lectura pública
CREATE POLICY "Allow public read access" ON webhook_events FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON webhook_events FOR INSERT WITH CHECK (true);

-- ============================================
-- 7. DATOS INICIALES (OPCIONAL)
-- ============================================

-- Insertar palabras de ejemplo
INSERT INTO custom_words (word, hint, difficulty, category) VALUES
  ('JAVASCRIPT', 'Popular programming language for web development', 'medium', 'programming'),
  ('TECHNOLOGY', 'Science applied to practical purposes', 'medium', 'general'),
  ('COMPUTER', 'Electronic device for processing data', 'easy', 'technology'),
  ('ALGORITHM', 'Step-by-step procedure for calculations', 'hard', 'programming'),
  ('DATABASE', 'Organized collection of data', 'medium', 'technology'),
  ('STREAMING', 'Continuous transmission of audio or video', 'easy', 'internet'),
  ('CYBERPUNK', 'Futuristic science fiction genre', 'medium', 'culture'),
  ('MINECRAFT', 'Popular sandbox video game', 'easy', 'gaming'),
  ('ADVENTURE', 'Exciting or unusual experience', 'easy', 'general'),
  ('CHAMPION', 'Winner of a competition', 'easy', 'general')
ON CONFLICT DO NOTHING;

-- ============================================
-- 8. FUNCIONES AUXILIARES
-- ============================================

-- Función para obtener el top 10 de jugadores
CREATE OR REPLACE FUNCTION get_top_players(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  player_name TEXT,
  total_points INTEGER,
  games_played INTEGER,
  games_won INTEGER,
  win_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    name,
    points,
    games_played,
    games_won,
    CASE 
      WHEN games_played > 0 THEN ROUND((games_won::NUMERIC / games_played::NUMERIC) * 100, 2)
      ELSE 0
    END as win_rate
  FROM players
  ORDER BY points DESC, games_won DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas del juego
CREATE OR REPLACE FUNCTION get_game_stats()
RETURNS TABLE (
  total_games INTEGER,
  total_players INTEGER,
  total_guesses INTEGER,
  avg_duration NUMERIC,
  most_used_word TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_games,
    (SELECT COUNT(DISTINCT name)::INTEGER FROM players) as total_players,
    SUM(total_guesses)::INTEGER as total_guesses,
    ROUND(AVG(duration_seconds)::NUMERIC, 2) as avg_duration,
    (SELECT word FROM game_history GROUP BY word ORDER BY COUNT(*) DESC LIMIT 1) as most_used_word
  FROM game_history;
END;
$$ LANGUAGE plpgsql;

-- Función para limpiar datos antiguos (más de 30 días)
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM game_history WHERE ended_at < NOW() - INTERVAL '30 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  DELETE FROM webhook_events WHERE timestamp < NOW() - INTERVAL '7 days';
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. COMENTARIOS EN TABLAS
-- ============================================

COMMENT ON TABLE game_state IS 'Stores the current active game state';
COMMENT ON TABLE players IS 'Player rankings and statistics';
COMMENT ON TABLE custom_words IS 'Custom word list for the game';
COMMENT ON TABLE game_history IS 'Historical record of all games played';
COMMENT ON TABLE webhook_events IS 'Log of all webhook events received';

-- ============================================
-- ✅ SETUP COMPLETO
-- ============================================

-- Verificar instalación
SELECT 
  'Setup completed!' as status,
  COUNT(*) as words_loaded
FROM custom_words;

-- Ver tablas creadas
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND table_name IN ('game_state', 'players', 'custom_words', 'game_history', 'webhook_events')
ORDER BY table_name;
