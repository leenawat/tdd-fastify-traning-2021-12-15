import { build } from '../helper'

const app = build()

describe('User Delete', () => {
  it('return 401 when request sent unauthorized', async () => {
    const response = await app.inject({
      url: `/api/users/1`,
      method: 'delete',
    })
    expect(response.statusCode).toBe(401)
  })
})

