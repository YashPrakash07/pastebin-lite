import { kv } from "@vercel/kv";


export interface Paste {
  id: string;
  content: string;
  created_at: number;
  expires_at?: number | null;
  max_views?: number | null;
  remaining_views?: number | null;
  language?: string | null;
  delete_token?: string | null;
  password_hash?: string | null;
}

export async function savePaste(paste: Paste) {
  const key = `paste:${paste.id}`;
  // We store as a hash.
  // Note: Vercel KV / Redis stores strings. We need to handle nulls/undefined.
  const data: Record<string, string | number> = {
    id: paste.id,
    content: paste.content,
    created_at: paste.created_at,
  };

  if (paste.expires_at) data.expires_at = paste.expires_at;
  
  if (paste.max_views !== undefined && paste.max_views !== null) {
      data.max_views = paste.max_views;
      data.remaining_views = paste.max_views;
  }

  if (paste.language) data.language = paste.language;
  
  if (paste.delete_token) data.delete_token = paste.delete_token;
  if (paste.password_hash) data.password_hash = paste.password_hash;

  await kv.hset(key, data);
  
  // Set a real TTL on the key for garbage collection, if expires_at is present.
  // We add a small buffer (e.g. 1 hour) just in case, but strict checking is done in app.
  // Or just set it exactly if we trust system time loosely. 
  // Since we use manual time checks for the "Deterministic Time for Testing", 
  // we rely on the logic, but real Redis TTL helps cleanup storage.
  if (paste.expires_at) {
      const now = Date.now();
      const ttlSeconds = Math.ceil((paste.expires_at - now) / 1000);
      if (ttlSeconds > 0) {
          await kv.expire(key, ttlSeconds + 3600); // +1 hour buffer
      }
  }
}

export type PasteResult = 
  | { status: "OK"; paste: Paste }
  | { status: "EXPIRED" }
  | { status: "LIMIT_REACHED" }
  | { status: "NOT_FOUND" };

export async function getPaste(id: string, now: number): Promise<PasteResult> {
  const key = `paste:${id}`;
  
  const script = `
    local key = KEYS[1]
    local now = tonumber(ARGV[1])

    if redis.call("EXISTS", key) == 0 then
        return cjson.encode({ status = "NOT_FOUND" })
    end

    local fields = redis.call("HGETALL", key)
    local paste = {}
    for i = 1, #fields, 2 do
        paste[fields[i]] = fields[i + 1]
    end

    if paste["expires_at"] and paste["expires_at"] ~= "null" then
        if tonumber(paste["expires_at"]) < now then
             return cjson.encode({ status = "EXPIRED" })
        end
    end

    if paste["password_hash"] and paste["password_hash"] ~= "null" then
        return cjson.encode({ status = "OK", paste = paste })
    end

    if paste["remaining_views"] and paste["remaining_views"] ~= "null" then
        local views = tonumber(paste["remaining_views"])
        if views <= 0 then
            return cjson.encode({ status = "LIMIT_REACHED" })
        end
        redis.call("HINCRBY", key, "remaining_views", -1)
        paste["remaining_views"] = views - 1
    end

    return cjson.encode({ status = "OK", paste = paste })
  `;

  try {
      const result = await kv.eval(script, [key], [now]);
      if (!result) return { status: "NOT_FOUND" };
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parsed: any = typeof result === 'string' ? JSON.parse(result) : result;

      if (parsed.status !== "OK") {
        return { status: parsed.status };
      }

      const rawPaste = parsed.paste;
      
      const paste: Paste = {
          id: rawPaste.id,
          content: rawPaste.content,
          created_at: parseInt(rawPaste.created_at),
          expires_at: rawPaste.expires_at ? parseInt(rawPaste.expires_at) : null,
          max_views: rawPaste.max_views ? parseInt(rawPaste.max_views) : null,
          remaining_views: rawPaste.remaining_views !== undefined && rawPaste.remaining_views !== null ? parseInt(rawPaste.remaining_views) : null,
          language: rawPaste.language || null,
          delete_token: rawPaste.delete_token || null,
          password_hash: rawPaste.password_hash || null
      };

      return { status: "OK", paste };

  } catch (err) {
      console.error("Redis Error", err);
      // If KV is not configured, we might want to return NOT_FOUND or handle differently
      return { status: "NOT_FOUND" }; 
  }
}

export async function decrementViews(id: string): Promise<boolean> {
    const key = `paste:${id}`;
    const script = `
        local key = KEYS[1]
        local views = redis.call("HGET", key, "remaining_views")
        if not views then return 1 end -- No limit
        if tonumber(views) <= 0 then return 0 end -- Limit reached
        redis.call("HINCRBY", key, "remaining_views", -1)
        return 1
    `;
    try {
        const result = await kv.eval(script, [key], []);
        return result === 1;
    } catch {
        return false;
    }
}

export async function checkHealth() {
    try {
        await kv.ping();
        return true;
    } catch {
        return false;
    }
}

export async function deletePaste(id: string, delete_token: string): Promise<boolean> {
    const key = `paste:${id}`;
    // We need to fetch the token first to verify
    const storedToken = await kv.hget(key, "delete_token");
    
    if (!storedToken || storedToken !== delete_token) {
        return false;
    }
    
    await kv.del(key);
    return true;
}
