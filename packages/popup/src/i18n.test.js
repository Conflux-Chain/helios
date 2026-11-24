// @vitest-environment jsdom
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {I18nextProvider, Trans} from 'react-i18next'
import {afterEach, expect, it} from 'vitest'
import i18n from './i18n'

const previousLanguage = i18n.language
const previousStored = window.localStorage.getItem('i18nextLng')
afterEach(async () => {
  await i18n.changeLanguage(previousLanguage)
  if (previousStored === null) window.localStorage.removeItem('i18nextLng')
  else window.localStorage.setItem('i18nextLng', previousStored)
})

it('restores the saved popup language and falls back to English', async () => {
  window.localStorage.setItem('i18nextLng', 'zh-CN')
  await i18n.changeLanguage()
  expect(i18n.t('confirm')).toBe('确认')
  await i18n.changeLanguage('fr-CA')
  expect(i18n.t('confirm')).toBe('Confirmer')
  expect(window.localStorage.getItem('i18nextLng')).toBe('fr-CA')
  await i18n.changeLanguage('de-DE')
  expect(i18n.t('confirm')).toBe('Confirm')
})

it('preserves transaction-count plurals and account-name interpolation', async () => {
  await i18n.changeLanguage('ru')
  for (const [count, expected] of [
    [1, 'Включает 1 транзакцию'],
    [2, 'Включает 2 транзакции'],
    [5, 'Включает 5 транзакций'],
  ]) {
    expect(i18n.t('callBundleTransactionCount', {count})).toBe(expected)
  }
  await i18n.changeLanguage('en')
  const html = renderToStaticMarkup(
    React.createElement(
      I18nextProvider,
      {i18n},
      React.createElement(Trans, {
        i18nKey: 'needAuthContent',
        values: {accountName: 'Test Account'},
      }),
    ),
  )
  expect(html).toContain('<br/>')
  expect(html).toContain('Authorize this site to use Test Account')
})
