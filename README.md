# @vcmap/hello-world

> Part of the [VC Map Project](https://github.com/virtualcitySYSTEMS/map-ui)

This is the `@vcmap/ui` **Hello World** plugin!

## Content

The plugin provides a minimal show-case working example including:

- implementing the VcsPlugin interface [index.js](/src/index.js)
  - plugin config
  - plugin state (set and getState)
  - plugin hooks
    - initialize
    - onVcsAppMounted
    - destroy
  - plugin serializing (toJSON)
  - internationalization (i18n)
- sample ui-component [helloWorld.vue](/src/helloWorld.vue)
  - using vcs and vuetify components
  - plugin assets (getPluginAssetUrl)
- plugin API testing [spec](/tests/helloWorld.spec.js)
