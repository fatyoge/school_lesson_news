export const REQUIRED_FIELDS = new Set([
  'id', 'title', 'theme', 'risk_level', 'estimated_duration_min', 'hook',
  'us_data', 'cn_data', 'comparison_anchor', 'interactions', 'ending',
  'filter_notes', 'images'
]);

const VALID_RISK_LEVELS = new Set(['low', 'medium', 'medium-high', 'high']);

export function validateStories(stories) {
  const errors = [];
  if (!Array.isArray(stories)) {
    errors.push('stories must be an array');
    return { ok: false, errors };
  }
  stories.forEach((s, idx) => {
    for (const field of REQUIRED_FIELDS) {
      if (!(field in s)) errors.push(`story[${idx}] (${s.id || '?'}) missing field: ${field}`);
    }
    if (s.risk_level && !VALID_RISK_LEVELS.has(s.risk_level)) {
      errors.push(`story[${idx}] (${s.id || '?'}) invalid risk_level: ${s.risk_level}`);
    }
  });
  return { ok: errors.length === 0, errors };
}

export async function loadStories(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load stories: ${res.status}`);
  const data = await res.json();
  const validation = validateStories(data.stories);
  if (!validation.ok) {
    console.error('stories.json validation errors:', validation.errors);
    throw new Error('stories.json failed schema validation');
  }
  return data.stories;
}
