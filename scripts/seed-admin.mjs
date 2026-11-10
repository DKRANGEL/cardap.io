// Cria (ou atualiza) o usuário admin. Uso:
//   ADMIN_EMAIL=... ADMIN_PASSWORD=... NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-admin.mjs
// Fora do Supabase local, exige o argumento --producao, para ninguém mexer no banco real por engano.
import { createClient } from '@supabase/supabase-js'

const { ADMIN_EMAIL, ADMIN_PASSWORD, NEXT_PUBLIC_SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: chave } = process.env

const falha = (mensagem) => {
    console.error(`Erro: ${mensagem}`)
    process.exit(1)
}

if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !url || !chave) {
    falha('defina ADMIN_EMAIL, ADMIN_PASSWORD, NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.')
}
if (ADMIN_PASSWORD.length < 8 || ADMIN_PASSWORD.length > 72) falha('a senha precisa ter de 8 a 72 caracteres.')

const local = ['127.0.0.1', 'localhost'].includes(new URL(url).hostname)
if (!local && !process.argv.includes('--producao')) {
    falha(`${new URL(url).host} não é o Supabase local. Para rodar mesmo assim, acrescente --producao.`)
}

const supabase = createClient(url, chave, { auth: { persistSession: false, autoRefreshToken: false } })
const email = ADMIN_EMAIL.trim().toLowerCase()

let existente = null
for (let pagina = 1; !existente; pagina++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page: pagina, perPage: 200 })
    if (error) falha(error.message)
    existente = data.users.find((u) => u.email?.toLowerCase() === email) ?? null
    if (data.users.length < 200) break
}

const dados = { email, password: ADMIN_PASSWORD, email_confirm: true, app_metadata: { role: 'admin' } }
const { error } = existente
    ? await supabase.auth.admin.updateUserById(existente.id, dados)
    : await supabase.auth.admin.createUser(dados)
if (error) falha(error.message)

console.log(`${existente ? 'Admin atualizado' : 'Admin criado'}: ${email} (${new URL(url).host})`)
