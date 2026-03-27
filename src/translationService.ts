const TRANSLATION_CACHE = new Map<string, string>();

export async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text || targetLang === 'es') return text;

  const cacheKey = `${text}_${targetLang}`;
  if (TRANSLATION_CACHE.has(cacheKey)) {
    return TRANSLATION_CACHE.get(cacheKey)!;
  }

  try {
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=es&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
    );

    if (!response.ok) {
      console.warn('Translation failed, using original text');
      return text;
    }

    const data = await response.json();
    const translatedText = data[0]?.map((item: any) => item[0]).join('') || text;

    TRANSLATION_CACHE.set(cacheKey, translatedText);
    return translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
}

export async function translateObject<T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[],
  targetLang: string
): Promise<T> {
  if (targetLang === 'es') return obj;

  const translated = { ...obj };

  for (const field of fields) {
    const value = obj[field];
    if (typeof value === 'string' && value) {
      translated[field] = await translateText(value, targetLang) as T[keyof T];
    }
  }

  return translated;
}

export async function translateArray<T extends Record<string, any>>(
  items: T[],
  fields: (keyof T)[],
  targetLang: string
): Promise<T[]> {
  if (targetLang === 'es') return items;

  const promises = items.map(item => translateObject(item, fields, targetLang));
  return Promise.all(promises);
}
