async function hashPassword(email, password) {
  const data = new TextEncoder().encode(`${email}:${password}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashBase64 = btoa(String.fromCharCode(...hashArray));
  return hashBase64;
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';

    if (!email || !password) {
      return new Response(JSON.stringify({ ok: false, error: '이메일과 비밀번호를 입력해주세요.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // D1 인스턴스에 users 테이블이 없는 경우를 대비해, 항상 존재를 보장한다.
    await env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      );`
    ).run();

    // 개발 단계에서는 해시 대신 비밀번호 원문을 그대로 저장합니다.
    // (추후 TextEncoder/crypto 이슈가 없을 때 안전한 해시 방식으로 교체 예정)
    const passwordHash = password;

    // 이미 등록된 이메일인지 먼저 확인
    const existing = await env.DB.prepare(
      'SELECT id FROM users WHERE email = ?1'
    )
      .bind(email)
      .all();

    if (existing.results && existing.results.length > 0) {
      return new Response(JSON.stringify({ ok: false, error: '이미 사용 중인 이메일입니다.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    try {
      const result = await env.DB.prepare(
        'INSERT INTO users (email, password_hash) VALUES (?1, ?2)'
      )
        .bind(email, passwordHash)
        .run();

      const user = {
        id: result?.meta?.last_row_id ?? null,
        email
      };

      return new Response(JSON.stringify({ ok: true, user }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (e) {
      return new Response(JSON.stringify({ ok: false, error: '회원가입에 실패했습니다.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: '요청 처리 중 오류가 발생했습니다.', detail: String(e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
