import { WindowSlot } from '@vcmap/ui';
import { version, name } from '../package.json';
import HelloWorld, { windowId } from './helloWorld.vue';

/**
 * @typedef {Object} PluginConfig
 * @property {boolean} [showHelloWorldBtn]
 */

/**
 * @typedef {Object} PluginState
 * @property {import("@vcmap/ui").WindowPositionOptions} [windowPosition]
 * @property {boolean} active
 */

/**
 * A function returning 'hello World!'.
 * @returns {string}
 */
export function helloWorld() {
  return 'hello World!';
}

/**
 * @param {PluginConfig} config - the configuration of this plugin instance, passed in from the app.
 * @param {string} baseUrl - the absolute URL from which the plugin was loaded (without filename, ending on /)
 * @returns {import("@vcmap/ui/src/vcsUiApp").VcsPlugin<PluginConfig, PluginState>}
 */
export default function helloWorldPlugin(config, baseUrl) {
  // eslint-disable-next-line no-console
  console.log(config, baseUrl);
  return {
    get name() {
      return name;
    },
    get version() {
      return version;
    },
    showHelloWorldBtn: config.showHelloWorldBtn ?? true,
    helloWorld,
    /**
     * @param {import("@vcmap/ui").VcsUiApp} vcsUiApp
     * @param {PluginState=} state
     */
    initialize(vcsUiApp, state) {
      // eslint-disable-next-line no-console
      console.log(
        'Called before loading the rest of the current context. Passed in the containing Vcs UI App ',
        vcsUiApp,
        state,
      );
      this._app = vcsUiApp;
    },
    /**
     * @param {import("@vcmap/ui").VcsUiApp} vcsUiApp
     * @returns {Promise<void>}
     */
    onVcsAppMounted: async (vcsUiApp) => {
      // eslint-disable-next-line no-console
      console.log(
        'Called when the root UI component is mounted and managers are ready to accept components',
        vcsUiApp,
      );
      vcsUiApp.windowManager.add(
        {
          id: windowId,
          component: HelloWorld,
          WindowSlot: WindowSlot.DETACHED,
          position: {
            left: '40%',
            right: '40%',
          },
        },
        name,
      );
    },
    /**
     * @param {boolean} forUrl
     * @returns {PluginState}
     */
    getState(forUrl) {
      // eslint-disable-next-line no-console
      console.log('Called when collecting state, e.g. for create link', forUrl);
      const state = {
        active: this._app.windowManager.has(windowId),
      };
      if (!forUrl) {
        state.position = this._app.windowManager.get(windowId).position;
      }
      return state;
    },
    /**
     * @returns {PluginConfig}
     */
    toJSON() {
      // eslint-disable-next-line no-console
      console.log('Called when serializing this plugin instance');
      return {
        showHelloWorldBtn: this.showHelloWorldBtn,
      };
    },
    i18n: {
      en: {
        helloWorld: {
          helloWorld: 'Hello World',
          close: 'Close',
          log: 'Log',
          logTooltip: 'Log Hello World to console',
        },
      },
      de: {
        helloWorld: {
          helloWorld: 'Hallo Welt',
          close: 'Schließen',
          log: 'Loggen',
          logTooltip: 'Logge Hello World in Console',
        },
      },
    },
    destroy() {
      // eslint-disable-next-line no-console
      console.log('hook to cleanup');
    },
  };
}
