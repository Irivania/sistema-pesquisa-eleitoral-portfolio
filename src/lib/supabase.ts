import { neon, neonConfig } from '@neondatabase/serverless';

neonConfig.disableWarningInBrowsers = true;

const connectionString = import.meta.env.VITE_NEON_DATABASE_URL;

if (!connectionString) {
  throw new Error('A variável VITE_NEON_DATABASE_URL não está definida no arquivo .env');
}

export const sql = neon(connectionString);

type AuthUser = {
  email?: string;
  user_metadata?: { name?: string; role?: 'master' | 'secondary' };
};

type DatabaseError = Error & { code?: string };

type QueryResult = {
  data: Record<string, unknown>[] | Record<string, unknown> | null;
  error: DatabaseError | null;
  count?: number | null;
};

type QueryBuilder = {
  eq: (column: string, value: unknown) => QueryBuilder;
  order: (column?: string, options?: { ascending?: boolean }) => Promise<QueryResult>;
  maybeSingle: () => Promise<QueryResult>;
  single: () => Promise<QueryResult>;
  then: <T>(onfulfilled: (value: QueryResult) => T | PromiseLike<T>) => PromiseLike<T>;
};

type SupabaseCompat = {
  auth: {
    getSession: () => Promise<{ data: { session: { user: AuthUser } | null }; error: DatabaseError | null }>;
    getUser: () => Promise<{ data: { user: AuthUser | null }; error: DatabaseError | null }>;
    onAuthStateChange: (callback: (event: string, session: { user: AuthUser } | null) => void) => { data: { subscription: { unsubscribe: () => void } } };
    signOut: () => Promise<{ error: DatabaseError | null }>;
    signInWithPassword: (credentials: { email: string; password: string }) => Promise<{ data: { user: AuthUser | null }; error: DatabaseError | null }>;
    signUp: (credentials: { email: string; password: string; options?: { data?: Record<string, unknown> } }) => Promise<{ data: { user: AuthUser | null }; error: DatabaseError | null }>;
  };
  from: (table: string) => {
    select: (columns?: string, options?: { count?: string; head?: boolean }) => QueryBuilder;
    insert: (values: Record<string, unknown>[]) => Promise<QueryResult>;
    upsert: (values: Record<string, unknown>, options?: { onConflict?: string }) => Promise<QueryResult>;
    update: (values: Record<string, unknown>) => { eq: (column: string, value: unknown) => Promise<{ error: DatabaseError | null }> };
    delete: () => { eq: (column: string, value: unknown) => Promise<{ error: DatabaseError | null }> };
  };
};

export const supabase = {
  auth: {
    getSession: async () => {
      return { data: { session: { user: { email: 'admin@portifolio.com' } } }, error: null };
    },
    getUser: async () => {
      return { data: { user: { email: 'admin@portifolio.com' } }, error: null };
    },
    onAuthStateChange: (callback: (event: string, session: unknown) => void) => {
      callback('SIGNED_IN', { user: { email: 'admin@portifolio.com' } });
      return {
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      };
    },
    signOut: async () => {
      return { error: null };
    },
    signInWithPassword: async (credentials: { email: string; password: string }) => {
      return { data: { user: { email: credentials.email } }, error: null };
    },
    signUp: async (credentials: { email: string; password: string; options?: { data?: Record<string, unknown> } }) => {
      return { data: { user: { email: credentials.email } }, error: null };
    }
  },
  from: (table?: string) => ({
    select: () => {
      const queryBuilder = {
        eq: (column: string, value: unknown) => {
          const filterBuilder = {
            maybeSingle: async () => {
              try {
                let data;
                if (table === 'interviewers') {
                  if (column === 'is_active') {
                    const res = await sql`SELECT * FROM interviewers WHERE is_active = ${Boolean(value)} LIMIT 1`;
                    data = res[0] || null;
                  } else {
                    const res = await sql`SELECT * FROM interviewers WHERE id = ${Number(value)} LIMIT 1`;
                    data = res[0] || null;
                  }
                } else if (table === 'invite_tokens') {
                  const res = await sql`SELECT * FROM invite_tokens WHERE code = ${String(value)} LIMIT 1`;
                  data = res[0] || null;
                } else if (table === 'app_settings') {
                  const res = await sql`SELECT * FROM app_settings WHERE id = ${Number(value)} LIMIT 1`;
                  data = res[0] || null;
                } else if (table === 'exception_codes') {
                  const res = await sql`SELECT * FROM exception_codes WHERE id = ${String(value)} LIMIT 1`;
                  data = res[0] || null;
                } else {
                  const res = await sql`SELECT * FROM surveys WHERE id = ${Number(value)} LIMIT 1`;
                  data = res[0] || null;
                }
                return { data, error: null };
              } catch (error) {
                return { data: null, error };
              }
            },
            single: async () => {
              const res = await filterBuilder.maybeSingle();
              return res;
            },
            order: async () => {
              return queryBuilder.order();
            },
            then: async (resolve: (val: unknown) => void) => {
              const res = await filterBuilder.maybeSingle();
              resolve(res);
            }
          };
          return filterBuilder;
        },
        order: async () => {
          try {
            let data;
            if (table === 'interviewers') {
              data = await sql`SELECT * FROM interviewers ORDER BY name ASC`;
            } else if (table === 'invite_tokens') {
              data = await sql`SELECT * FROM invite_tokens ORDER BY created_at DESC`;
            } else if (table === 'app_settings') {
              data = await sql`SELECT * FROM app_settings WHERE id = 1`;
            } else if (table === 'exception_codes') {
              data = await sql`SELECT * FROM exception_codes ORDER BY created_at DESC`;
            } else {
              data = await sql`SELECT * FROM surveys ORDER BY created_at DESC`;
            }
            return { data, error: null };
          } catch (error) {
            return { data: null, error };
          }
        },
        then: async (resolve: (val: unknown) => void) => {
          const res = await queryBuilder.order();
          resolve(res);
        }
      };
      return queryBuilder;
    },
    insert: async (values: Record<string, unknown>[]) => {
      try {
        const item = values[0];
        if (table === 'interviewers') {
          await sql`
            INSERT INTO interviewers (name, code, is_active)
            VALUES (${String(item.name)}, ${String(item.code)}, ${Boolean(item.is_active ?? true)})
          `;
        } else if (table === 'invite_tokens') {
          await sql`
            INSERT INTO invite_tokens (code, expires_at, is_used)
            VALUES (${String(item.code)}, ${String(item.expires_at)}, ${Boolean(item.is_used ?? false)})
          `;
        } else if (table === 'exception_codes') {
          await sql`
            INSERT INTO exception_codes (code, created_by)
            VALUES (${String(item.code)}, ${item.created_by ? String(item.created_by) : null})
          `;
        } else {
          await sql`
            INSERT INTO surveys (
              interviewer_name, rodada, cidade, sexo, faixa_etaria, 
              escolaridade, area, aval_prefeta, aval_governadora, problema_principal
            ) VALUES (
              ${String(item.interviewer_name)}, ${String(item.rodada)}, ${String(item.cidade)}, ${String(item.sexo)}, ${String(item.faixa_etaria)},
              ${String(item.escolaridade)}, ${String(item.area)}, ${String(item.aval_prefeta)}, ${String(item.aval_governadora)}, ${String(item.problema_principal)}
            )
          `;
        }
        return { data: [item], error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
    upsert: async (values: Record<string, unknown>) => {
      try {
        const item = values;
        if (table === 'app_settings') {
          const result = await sql`
            INSERT INTO app_settings (
              id, override_active, override_expires_at, updated_at, updated_by
            ) VALUES (
              ${Number(item.id ?? 1)}, ${Boolean(item.override_active)},
              ${item.override_expires_at ? String(item.override_expires_at) : null},
              ${item.updated_at ? String(item.updated_at) : new Date().toISOString()},
              ${item.updated_by ? String(item.updated_by) : null}
            )
            ON CONFLICT (id) DO UPDATE SET
              override_active = EXCLUDED.override_active,
              override_expires_at = EXCLUDED.override_expires_at,
              updated_at = EXCLUDED.updated_at,
              updated_by = EXCLUDED.updated_by
            RETURNING *
          `;
          return { data: result[0] || null, error: null };
        }

        return { data: null, error: new Error(`Upsert não suportado para a tabela ${table}`) };
      } catch (error) {
        return { data: null, error };
      }
    },
    update: (values: Record<string, unknown>) => ({
      eq: async (column: string, value: unknown) => {
        try {
          if (table === 'invite_tokens' && column === 'id') {
            await sql`UPDATE invite_tokens SET is_used = ${Boolean(values.is_used)} WHERE id = ${Number(value)}`;
          }
          return { error: null };
        } catch (error) {
          return { error };
        }
      }
    }),
    delete: () => ({
      eq: async (column: string, value: unknown) => {
        try {
          if (column === 'id') {
            if (table === 'interviewers') {
              await sql`DELETE FROM interviewers WHERE id = ${Number(value)}`;
            } else if (table === 'invite_tokens') {
              await sql`DELETE FROM invite_tokens WHERE id = ${Number(value)}`;
            } else if (table === 'exception_codes') {
              await sql`DELETE FROM exception_codes WHERE id = ${String(value)}`;
            } else {
              await sql`DELETE FROM surveys WHERE id = ${Number(value)}`;
            }
          }
          return { error: null };
        } catch (error) {
          return { error };
        }
      }
    })
  })
} as unknown as SupabaseCompat;