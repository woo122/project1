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

    // register에서 비밀번호 원문을 password_hash 컬럼에 그대로 저장하므로,
    // 여기서는 같은 값으로 비교한다. (개발 단계용, 추후 안전한 해시 방식으로 교체 예정)
    const { results } = await env.DB.prepare(
      'SELECT id, email FROM users WHERE email = ?1 AND password_hash = ?2'
    )
      .bind(email, password)
      .all();

    if (!results || results.length === 0) {
      return new Response(JSON.stringify({ ok: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const user = results[0];

    return new Response(JSON.stringify({ ok: true, user }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: '요청 처리 중 오류가 발생했습니다.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
