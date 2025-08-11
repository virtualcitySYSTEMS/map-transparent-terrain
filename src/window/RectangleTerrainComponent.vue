<template>
  <v-sheet class="hide-scrollbar">
    <VcsHelp
      v-if="createExtent.active"
      text="transparentTerrain.settings.rectangle.hint"
      :show="true"
    />
    <VcsFormSection
      v-else
      heading="transparentTerrain.settings.modify"
      :header-actions="actions"
      :action-button-list-overflow-count="5"
    />
    <VcsExtent v-model="localExtent" />
    <v-divider class="mt-2" />
    <GlobalTerrainComponent />
  </v-sheet>
</template>
<script lang="ts">
  import type { VcsAction } from '@vcmap/ui';
  import {
    VcsFormSection,
    VcsExtent,
    setupExtentComponentActions,
    NotificationType,
    VcsHelp,
  } from '@vcmap/ui';
  import { VSheet, VDivider } from 'vuetify/components';
  import {
    computed,
    defineComponent,
    inject,
    onMounted,
    onUnmounted,
    ref,
    watch,
  } from 'vue';
  import type { VectorStyleItem } from '@vcmap/core';
  import { Extent } from '@vcmap/core';
  import GlobalTerrainComponent from './GlobalTerrainComponent.vue';
  import type TransparentTerrainManager from '../transparentTerrainManager.js';
  import type RectangleTerrainMode from '../mode/rectangleTerrainMode.js';

  export default defineComponent({
    name: 'RectangleTerrainComponent',
    components: {
      VcsHelp,
      VcsExtent,
      VcsFormSection,
      GlobalTerrainComponent,
      VSheet,
      VDivider,
    },
    setup() {
      const manager = inject<TransparentTerrainManager>('manager')!;
      const currentMode = manager.currentMode.value! as RectangleTerrainMode;
      const { isPersistent } = currentMode;
      const localExtent = ref(currentMode.getExtent().toJSON());

      const extent = computed({
        get() {
          return new Extent(localExtent.value);
        },
        set(value) {
          localExtent.value = value.toJSON();
        },
      });

      watch(extent, () => {
        currentMode.updateExtent(extent.value);
      });

      const {
        actions: [
          showExtentAction,
          createExtentAction,
          vertexAction,
          translateAction,
          zoomToExtentAction,
        ],
        destroy,
        layer,
      } = setupExtentComponentActions(manager.app, extent);

      const createExtent = ref<VcsAction>(createExtentAction);

      (layer.style as VectorStyleItem).fillColor = [255, 255, 255, 0];

      if (extent.value.isValid()) {
        layer.activate().catch((e: unknown) => {
          manager.app.notifier.add({
            type: NotificationType.ERROR,
            message: `Failed to activate extent layer: ${(e as Error).message}`,
          });
        });
      }

      onMounted(() => {
        if (!isPersistent.value) {
          // eslint-disable-next-line
          // @ts-ignore
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          createExtent.value.callback();
        }
      });

      onUnmounted(() => {
        destroy();
      });

      return {
        actions: [
          showExtentAction,
          vertexAction,
          translateAction,
          zoomToExtentAction,
        ],
        isPersistent,
        localExtent,
        createExtent,
      };
    },
  });
</script>
<style lang="scss" scoped>
  :deep(.vcs-text-field input) {
    text-align: right;
  }
</style>
