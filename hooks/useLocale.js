import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLocale } from 'redux/actions/app';
import { useRouter } from 'next/router';
import { get, setItem } from 'lib/web';
import { LOCALE_CONFIG } from 'lib/constants';
import { getDateLocale, getTextDirection } from 'lib/lang';
import useForceUpdate from 'hooks/useForceUpdate';
import enUS from 'public/messages/en-US.json';

const messages = {
  'en-US': enUS,
};

export default function useLocale() {
  const locale = useSelector(state => state.app.locale);
  const dispatch = useDispatch();
  const { basePath } = useRouter();
  const forceUpdate = useForceUpdate();
  const dir = getTextDirection(locale);
  const dateLocale = getDateLocale(locale);

  async function loadMessages(locale) {
    const { ok, data } = await get(`${basePath}/messages/${locale}.json`);

    if (ok) {
      messages[locale] = data;
    }
  }

  async function saveLocale(value) {
    if (!messages[value]) {
      await loadMessages(value);
    }

    setItem(LOCALE_CONFIG, value);

    if (locale !== value) {
      dispatch(setLocale(value));
    } else {
      forceUpdate();
    }
  }

  useEffect(() => {
    if (!messages[locale]) {
      saveLocale(locale);
    }
  }, [locale]);

  return { locale, saveLocale, messages, dir, dateLocale };
}
