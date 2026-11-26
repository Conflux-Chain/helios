import {expect, it, vi} from 'vitest'
import {startDomainSync} from './background.js'
import {SYNC_MINUTES} from './service.js'

it('registers the alarm listener before an async lookup and does not reset an existing alarm on wake', async () => {
  const alarms = {
    onAlarm: {addListener: vi.fn()},
    get: vi.fn(async () => ({name: 'already scheduled'})),
    create: vi.fn(),
  }
  const refresh = vi.fn(async () => 'updated')
  const scheduled = startDomainSync(alarms, refresh)
  expect(alarms.onAlarm.addListener).toHaveBeenCalledTimes(1)
  const [listener] = alarms.onAlarm.addListener.mock.calls[0]
  await scheduled
  expect(alarms.create).not.toHaveBeenCalled()
  await listener({name: 'other alarm'})
  expect(refresh).not.toHaveBeenCalled()
  const [name] = alarms.get.mock.calls[0]
  await listener({name})
  expect(refresh).toHaveBeenCalledTimes(1)
})

it('schedules periodic sync on first install or when the browser discarded the alarm', async () => {
  const alarms = {
    onAlarm: {addListener: vi.fn()},
    get: vi.fn(async () => undefined),
    create: vi.fn(),
  }
  await startDomainSync(alarms, vi.fn())
  expect(alarms.create).toHaveBeenCalledWith(
    'phishing.refreshMetaMaskDomains',
    {delayInMinutes: 1, periodInMinutes: SYNC_MINUTES},
  )
})
