import { icebreaker } from '@icebreakers/eslint-config'

export default icebreaker(
  {
    vue: true,
    ignores: [
      '**/fixtures/**',
      'apps/host/public',
      'apps/host/worker-configuration.d.ts',
    ],
  },
)
