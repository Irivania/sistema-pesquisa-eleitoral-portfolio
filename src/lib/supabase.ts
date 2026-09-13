import { neon, neonConfig } from '@neondatabase/serverless';

neonConfig.fetchConnectionCache = true;
neonConfig.disableWarningInBrowsers = true;

const connectionString = import.meta.env.VITE_NEON_DATABASE_URL;

if (!connectionString) {
  throw new Error('A variável VITE_NEON_DATABASE_URL não está definida no arquivo .env');
}

export const sql = neon(connectionString);

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
    signInWithPassword: async () => {
      return { data: { user: { email: 'admin@portifolio.com' } }, error: null };
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
};