import { build } from '../helper'
describe('example test', () => {
  const app = build()
  it('example is loaded', async () => {
    const res = await app.inject({
      url: '/example',
    })
    expect(res.payload).toBe('this is an example')
  })
})
