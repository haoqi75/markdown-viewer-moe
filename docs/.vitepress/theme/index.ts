import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import '@catppuccin/vitepress/theme/mocha/pink.css'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'layout-top': () =>
        h('div', { class: 'moe-deco-wrapper' }, [
          h('span', { class: 'moe-deco' }, '🌸'),
          h('span', { class: 'moe-deco' }, '✨'),
          h('span', { class: 'moe-deco' }, '💗'),
          h('span', { class: 'moe-deco' }, '🦄'),
        ]),
    })
  },
}