import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Bear.Core.Admin",
  description: "A VitePress Site",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "/assets/image/logo.png",
    nav: [
      { text: 'API', link: '/' },
      { text: '博客', link: '/blog' },
      { text: '技术支持', link: '/markdown-examples' },
       { text: '链接',
        items: [
          { text: 'gitee', link: '/item-1' },
          { text: 'github', link: '/item-2' },
        ]
       }
    ],

    sidebar: [
      {
        text: '博客',
        items: [
          { text: '艺术来源开发', link: '/excel-download.md' },
          { text: '前端excel', link: '/excel-download.md' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'gitee', link: 'https://gitee.com/ByteXiong' },
      { icon: 'github', link: 'https://github.com/ByteXiong' }
    ]
  }
})
