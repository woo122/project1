async function ensureItinerariesTable(env) {
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS itineraries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );`
  ).run();
}

export async function onRequestPost({ request, env }) {
  try {
    await ensureItinerariesTable(env);

    const body = await request.json();
    const itinerary = body.itinerary || body;
    const title = body.title || itinerary?.title || "Untitled itinerary";
    const userId = body.userId || null;

    const result = await env.DB.prepare(
      "INSERT INTO itineraries (user_id, title, data) VALUES (?1, ?2, ?3)"
    )
      .bind(userId, title, JSON.stringify(itinerary))
      .run();

    const responseBody = {
      ok: true,
      id: result?.meta?.last_row_id ?? null
    };

    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: "요청 처리 중 오류가 발생했습니다.", detail: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function onRequestGet({ request, env }) {
  try {
    await ensureItinerariesTable(env);

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const userId = url.searchParams.get("userId");

    if (id && userId) {
      // 단일 일정 조회 (해당 사용자 소유인지 확인)
      const { results } = await env.DB.prepare(
        "SELECT id, title, data, created_at FROM itineraries WHERE id = ?1 AND user_id = ?2"
      )
        .bind(id, userId)
        .all();

      if (!results || results.length === 0) {
        return new Response(JSON.stringify({ ok: false, error: "일정을 찾을 수 없습니다." }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }

      const row = results[0];
      let parsed;
      try {
        parsed = JSON.parse(row.data);
      } catch (e) {
        parsed = null;
      }

      return new Response(JSON.stringify({
        ok: true,
        id: row.id,
        title: row.title,
        created_at: row.created_at,
        itinerary: parsed
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (userId) {
      // 특정 사용자의 일정 목록
      const { results } = await env.DB.prepare(
        "SELECT id, title, created_at FROM itineraries WHERE user_id = ?1 ORDER BY created_at DESC"
      )
        .bind(userId)
        .all();

      return new Response(JSON.stringify(results || []), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // userId가 없으면 최근 20개 전체 (기존 동작 유지)
    const { results } = await env.DB.prepare(
      "SELECT id, title, created_at FROM itineraries ORDER BY created_at DESC LIMIT 20"
    ).all();

    return new Response(JSON.stringify(results || []), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: "요청 처리 중 오류가 발생했습니다.", detail: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function onRequestPut({ request, env }) {
  try {
    await ensureItinerariesTable(env);

    const body = await request.json();
    const id = body.id;
    const userId = body.userId;
    const title = body.title || body.itinerary?.title || "Untitled itinerary";
    const itinerary = body.itinerary;

    if (!id || !userId) {
      return new Response(JSON.stringify({ ok: false, error: "id와 userId가 필요합니다." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // itinerary가 있으면 제목 + 내용 모두 업데이트, 없으면 제목만 업데이트
    let query;
    let params;
    if (itinerary) {
      query = "UPDATE itineraries SET title = ?1, data = ?2 WHERE id = ?3 AND user_id = ?4";
      params = [title, JSON.stringify(itinerary), id, userId];
    } else {
      query = "UPDATE itineraries SET title = ?1 WHERE id = ?2 AND user_id = ?3";
      params = [title, id, userId];
    }

    const result = await env.DB.prepare(query)
      .bind(...params)
      .run();

    return new Response(JSON.stringify({ ok: true, changes: result?.meta?.changes ?? 0 }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: "요청 처리 중 오류가 발생했습니다.", detail: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function onRequestDelete({ request, env }) {
  try {
    await ensureItinerariesTable(env);

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const userId = url.searchParams.get("userId");

    if (!id || !userId) {
      return new Response(JSON.stringify({ ok: false, error: "id와 userId가 필요합니다." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const result = await env.DB.prepare(
      "DELETE FROM itineraries WHERE id = ?1 AND user_id = ?2"
    )
      .bind(id, userId)
      .run();

    return new Response(JSON.stringify({ ok: true, changes: result?.meta?.changes ?? 0 }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: "요청 처리 중 오류가 발생했습니다.", detail: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
