/*
# Create Electoral Survey System Tables

## Overview
Creates the database schema for the "Levantamento Interno de Opinião - Bezerros/PE - Setembro/2026" 
electoral survey management system. This is a multi-user system with two profiles:
- Entrevistadores (interviewers): collect survey responses in the field
- Administrador: views consolidated reports and manages collected data

## New Tables
- `surveys`: Stores individual questionnaire responses with all survey questions.
  - `id` (uuid, PK)
  - `interviewer_name` (text, not null): Name/ID of the interviewer who collected the data
  - `bairro` (text, not null): Neighborhood/locality in Bezerros
  - `sexo` (text, not null): Gender
  - `faixa_etaria` (text, not null): Age range
  - `escolaridade` (text, not null): Education level
  - `area` (text, not null): Urban or Rural zone
  - `aval_prefeita` (text): Rating of Mayor Lucielle Laurentino
  - `aval_governadora` (text): Rating of Governor Raquel Lyra
  - `problema_principal` (text): Main problem of Bezerros (spontaneous)
  - `problema_principal_outro` (text): Free text when "Outra" is selected
  - `senado_espontanea` (text[]): Senate candidates - spontaneous (up to 2)
  - `senado_estimulada` (text[]): Senate candidates - stimulated (up to 2)
  - `rejeicao_senado` (text): Senate rejection (single choice)
  - `dep_federal` (text): Federal Deputy choice
  - `dep_estadual` (text): State Deputy choice
  - `influencia_apoio` (text): Influence of mayor's support
  - `peso_escolha` (text): What weighs most in candidate choice
  - `peso_escolha_outro` (text): Free text when "Outra" is selected
  - `veiculo_comunicacao` (text): Most trusted media vehicle
  - `created_at` (timestamptz): When the survey was submitted

## Security
- RLS enabled on `surveys`.
- CRUD open to `anon, authenticated` because this app has no sign-in screen —
  interviewers and admins all use the anon key. The data is intentionally shared
  across all users of the system.

## Notes
1. Array columns (`senado_espontanea`, `senado_estimulada`) store up to 2 candidate
   selections for the Senate voting questions.
2. No `user_id` column — no auth integration required by the spec.
3. All text fields store the Portuguese label values directly for easy reporting.
*/

CREATE TABLE IF NOT EXISTS surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interviewer_name text NOT NULL,
  bairro text NOT NULL,
  sexo text NOT NULL,
  faixa_etaria text NOT NULL,
  escolaridade text NOT NULL,
  area text NOT NULL,
  aval_prefeta text,
  aval_governadora text,
  problema_principal text,
  problema_principal_outro text,
  senado_espontanea text[],
  senado_estimulada text[],
  rejeicao_senado text,
  dep_federal text,
  dep_estadual text,
  influencia_apoio text,
  peso_escolha text,
  peso_escolha_outro text,
  veiculo_comunicacao text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_surveys" ON surveys;
CREATE POLICY "anon_select_surveys" ON surveys FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_surveys" ON surveys;
CREATE POLICY "anon_insert_surveys" ON surveys FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_surveys" ON surveys;
CREATE POLICY "anon_update_surveys" ON surveys FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_surveys" ON surveys;
CREATE POLICY "anon_delete_surveys" ON surveys FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_surveys_interviewer ON surveys(interviewer_name);
CREATE INDEX IF NOT EXISTS idx_surveys_bairro ON surveys(bairro);
CREATE INDEX IF NOT EXISTS idx_surveys_area ON surveys(area);
CREATE INDEX IF NOT EXISTS idx_surveys_created_at ON surveys(created_at DESC);