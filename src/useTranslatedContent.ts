import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { translateArray, translateText } from './translationService';

export function useTranslatedArticles<T extends Record<string, any>>(
  articles: T[]
): T[] {
  const { language } = useLanguage();
  const [translatedArticles, setTranslatedArticles] = useState<T[]>(articles);

  useEffect(() => {
    const translate = async () => {
      if (language === 'es' || articles.length === 0) {
        setTranslatedArticles(articles);
        return;
      }

      const translated = await translateArray(
        articles,
        ['title', 'content', 'summary', 'author', 'category', 'document_type'],
        language
      );
      setTranslatedArticles(translated);
    };

    translate();
  }, [articles, language]);

  return language === 'es' ? articles : translatedArticles;
}

export function useTranslatedCategories(categories: string[]): string[] {
  const { language } = useLanguage();
  const [translatedCategories, setTranslatedCategories] = useState<string[]>(categories);

  useEffect(() => {
    const translate = async () => {
      if (language === 'es' || categories.length === 0) {
        setTranslatedCategories(categories);
        return;
      }

      const promises = categories.map(cat => translateText(cat, language));
      const translated = await Promise.all(promises);
      setTranslatedCategories(translated);
    };

    translate();
  }, [categories, language]);

  return language === 'es' ? categories : translatedCategories;
}

export function useTranslatedContacts(contacts: any[]): any[] {
  const { language } = useLanguage();
  const [translatedContacts, setTranslatedContacts] = useState(contacts);

  useEffect(() => {
    const translate = async () => {
      if (language === 'es' || contacts.length === 0) {
        setTranslatedContacts(contacts);
        return;
      }

      const translated = await translateArray(
        contacts,
        ['name', 'bio', 'job_title', 'services_description'],
        language
      );
      setTranslatedContacts(translated);
    };

    translate();
  }, [contacts, language]);

  return language === 'es' ? contacts : translatedContacts;
}

export function useTranslatedText(text: string | undefined | null): string {
  const { language } = useLanguage();
  const [translatedText, setTranslatedText] = useState(text || '');

  useEffect(() => {
    const translate = async () => {
      if (!text || language === 'es') {
        setTranslatedText(text || '');
        return;
      }

      const translated = await translateText(text, language);
      setTranslatedText(translated);
    };

    translate();
  }, [text, language]);

  return language === 'es' ? (text || '') : translatedText;
}
