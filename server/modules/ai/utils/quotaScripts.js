/**
 * Lua scripts for atomic Redis AI Quota reservation and reconciliation.
 */

export const reserveQuotaLua = `
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local expiry = tonumber(ARGV[2])

local current = redis.call("GET", key)
if current then
    current = tonumber(current)
else
    current = 0
end

if current >= limit then
    return {0, current}
end

local new_val = redis.call("INCR", key)
if new_val == 1 then
    redis.call("EXPIRE", key, expiry)
end

return {1, new_val}
`;

export const releaseQuotaLua = `
local key = KEYS[1]
local current = redis.call("GET", key)

if current and tonumber(current) > 0 then
    local new_val = redis.call("DECR", key)
    return new_val
end

return 0
`;

export const mergeAnonymousQuotaLua = `
local anonKey = KEYS[1]
local userKey = KEYS[2]
local expiry = tonumber(ARGV[1])

local anonUsage = redis.call("GET", anonKey)

if anonUsage and tonumber(anonUsage) > 0 then
    local usage = tonumber(anonUsage)
    
    -- Increment the user's key by the anonymous usage
    local userNewVal = redis.call("INCRBY", userKey, usage)
    
    -- Set expiry if it's the first time
    if userNewVal == usage then
        redis.call("EXPIRE", userKey, expiry)
    end
    
    -- Delete the anonymous key to prevent double merging (e.g. into another account)
    redis.call("DEL", anonKey)
    
    return usage
end

return 0
`;
