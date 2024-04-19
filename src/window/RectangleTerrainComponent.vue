<template>
  <v-sheet class="hide-scrollbar">
    <VcsFormSection
      heading="transparentTerrain.settings.modify"
      :header-actions="actions"
      :action-button-list-overflow-count="5"
    >
      <v-row v-if="!isPersistent" no-gutters class="py-2 px-2">
        <p>{{ $t('transparentTerrain.settings.rectangle.hint') }}</p>
      </v-row>
      <v-divider />
    </VcsFormSection>
    <VcsExtent v-model="localExtent" />
    <v-divider class="mt-2" />
    <GlobalTerrainComponent />
  </v-sheet>
</template>
<script lang="ts">
  import {
    VcsFormSection,
    VcsExtent,
    setupExtentComponentActions,
    NotificationType,
  } from '@vcmap/ui';
  import { VRow, VSheet, VDivider } from 'vuetify/lib';
  import {
    computed,
    defineComponent,
    inject,
    onMounted,
    onUnmounted,
    ref,
    watch,
  } from 'vue';
  import { Extent, VectorStyleItem } from '@vcmap/core';
  import GlobalTerrainComponent from './GlobalTerrainComponent.vue';
  import TransparentTerrainManager from '../transparentTerrainManager.js';
  import RectangleTerrainMode from '../mode/rectangleTerrainMode.js';

  export default defineComponent({
    name: 'RectangleTerrainComponent',
    components: {
      VcsExtent,
      VcsFormSection,
      GlobalTerrainComponent,
      VRow,
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
      } = setupExtentComponentActions(manager.app, extent, false);

      (layer.style as VectorStyleItem).fillColor = [255, 255, 255, 0];

      if (extent.value.isValid()) {
        layer.activate().catch((err) => {
          manager.app.notifier.add({
            type: NotificationType.ERROR,
            message: `Failed to activate extent layer: ${
              (err as Error).message
            }`,
          });
        });
      }

      onMounted(() => {
        if (!isPersistent.value) {
          // eslint-disable-next-line
          // @ts-ignore
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-floating-promises
          createExtentAction.callback();
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
      };
    },
  });
</script>
