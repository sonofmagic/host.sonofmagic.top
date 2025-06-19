import { sql } from 'drizzle-orm'

// String.raw
function css(template: {
  raw: readonly string[] | ArrayLike<string>
}, ...substitutions: any[]) {
  console.log(template, substitutions)
}

describe('sql', () => {
  it('should work', () => {
    expect(sql`1 ${'12'}`).toMatchSnapshot()
  })

  it('css', () => {
    const selector = '.apap'
    const color = 'rgba(1,1,1,0.1)'
    expect(css`
      .a{
        color: red;
      }

      ${selector}{
        --xx-yy: ${color};
        color: var(--xx-yy);
      }
      `).toMatchSnapshot()
  })
})
