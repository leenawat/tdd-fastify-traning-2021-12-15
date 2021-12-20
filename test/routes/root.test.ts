import { build } from '../helper'

const app = build()

describe('root tests', () => {
  it('default root route', async () => {
    const res = await app.inject({
      url: '/',
    })
    expect(JSON.parse(res.payload)).toEqual({ root: true })
  })
})
