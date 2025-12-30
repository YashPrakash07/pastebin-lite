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

export async function getPaste(id: string, now: number): Promise<Paste | null> {
  const key = `paste:${id}`;
  
  // Lua script to perform atomic check-and-decrement
  // We return the JSON encoded paste if valid, or nil.
  // note: keys/args are stringified.
  
  // Note: HGETALL returns an array [field, value, field, value...] in typical redis,
  // but @vercel/kv hgetall returns an object.
  // However, inside Lua, redis.call('HGETALL') returns the array.
  
  const script = `
    local key = KEYS[1]
    local now = tonumber(ARGV[1])

    if redis.call("EXISTS", key) == 0 then
        return nil
    end

    local fields = redis.call("HGETALL", key)
    local paste = {}
    -- Convert array to map
    for i = 1, #fields, 2 do
        paste[fields[i]] = fields[i + 1]
    end

    -- Check Expiry (if exists)
    if paste["expires_at"] and paste["expires_at"] ~= "null" then
        if tonumber(paste["expires_at"]) < now then
             return nil
        end
    end

    -- If password protected, WE DO NOT DECREMENT HERE.
    -- The API must verify password first, then call decrementViews manually.
    if paste["password_hash"] and paste["password_hash"] ~= "null" then
        return cjson.encode(paste)
    end

    -- Check View Limit (if exists)
    if paste["remaining_views"] and paste["remaining_views"] ~= "null" then
        local views = tonumber(paste["remaining_views"])
        if views <= 0 then
            return nil
        end
        -- Decrement
        redis.call("HINCRBY", key, "remaining_views", -1)
        paste["remaining_views"] = views - 1
    end

    return cjson.encode(paste)
  `;

  try {
      const result = await kv.eval(script, [key], [now]);
      if (!result) return null;
      
      const parsed = typeof result === 'string' ? JSON.parse(result) : result;
      // Ensure types
      return {
          id: parsed.id,
          content: parsed.content,
          created_at: parseInt(parsed.created_at),
          expires_at: parsed.expires_at ? parseInt(parsed.expires_at) : null,
          max_views: parsed.max_views ? parseInt(parsed.max_views) : null,
          remaining_views: parsed.remaining_views !== undefined && parsed.remaining_views !== null ? parseInt(parsed.remaining_views) : null,
          language: parsed.language || null,
          delete_token: parsed.delete_token || null,
          password_hash: parsed.password_hash || null
      };
  } catch (err) {
      console.error("Redis Error", err);
      // Fallback or error
      // If KV is not configured, this will throw.
      return null;
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
