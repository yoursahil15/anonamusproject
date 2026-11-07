const windows = new Map();

export const authRateLimit = (req, res, next) => {
  const now = Date.now();
  const key = `${req.ip}:${req.path}`;
  const current = windows.get(key);
  const entry = !current || current.until <= now ? { count: 0, until: now + 15 * 60 * 1000 } : current;
  entry.count += 1;
  windows.set(key, entry);
  if (windows.size > 10000) for (const [id, window] of windows) if (window.until <= now) windows.delete(id);
  if (entry.count > 10) return res.status(429).json({ msg: "Too many requests. Try again later." });
  next();
};
