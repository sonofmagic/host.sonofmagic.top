import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
// https://vitepress.dev/reference/site-config
export default withMermaid(defineConfig({
  title: 'host.sonofmagic.top',
  description: 'host.sonofmagic.top',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '主页', link: '/' },
      { text: '快速开始', link: '/start' },
    ],

    sidebar: [
      {
        items: [
          { text: '如何使用', link: '/usage' },
          { text: '如何私有化部署', link: '/self-host' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/sonofmagic/host.sonofmagic.top' },
    ],
  },
}),
)
