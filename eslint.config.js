import { icebreaker } from '@icebreakers/eslint-config'

export default icebreaker(
  {
    ignores: [
      '**/fixtures/**',
      'apps/host/public',
      'apps/host/worker-configuration.d.ts',
    ],
  },
)
