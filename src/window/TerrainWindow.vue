<template>
  <VcsWorkspaceWrapper
    :disable-add="isPersistent"
    :disable-new="terrainType === types.Global"
    @add-clicked="addToCategory"
    @new-clicked="createNew"
  >
    <GlobalTerrainComponent v-if="terrainType === types.Global" />
    <RectangleTerrainComponent v-if="terrainType === types.Rectangle" />
    <BoxTerrainComponent v-if="terrainType === types.Box" />
  </VcsWorkspaceWrapper>
</template>

<script lang="ts">
  import type { CollectionComponentClass, WindowState } from '@vcmap/ui';
  import { VcsWorkspaceWrapper } from '@vcmap/ui';
  import { inject, computed, defineComponent, watch } from 'vue';
  import type { Category } from '@vcmap/core';
  import GlobalTerrainComponent from './GlobalTerrainComponent.vue';
  import { TransparentTerrainType } from '../mode/terrainMode.js';
  import BoxTerrainComponent from './BoxTerrainComponent.vue';
  import type TransparentTerrainManager from '../transparentTerrainManager.js';
  import type { TransparentTerrainItem } from '../category/transparentTerrainCategory.js';
  import { addToCategoryCollection } from '../category/transparentTerrainCategory.js';
  import RectangleTerrainComponent from './RectangleTerrainComponent.vue';

  export default defineComponent({
    name: 'TerrainWindow',
    components: {
      BoxTerrainComponent,
      RectangleTerrainComponent,
      GlobalTerrainComponent,
      VcsWorkspaceWrapper,
    },
    props: {
      itemName: {
        type: String,
        default: undefined,
      },
    },
    setup(props, { attrs }) {
      const windowState = attrs['window-state'] as WindowState;
      const manager = inject<TransparentTerrainManager>('manager')!;
      const category = inject<Category<TransparentTerrainItem>>('category')!;
      const collectionComponent = inject<
        CollectionComponentClass<TransparentTerrainItem>
      >('collectionComponent')!;

      manager.start(
        collectionComponent.collection.getByKey(props.itemName)?.mode,
      );

      const currentMode = manager.currentMode.value!;
      const terrainType = currentMode.type;
      const isPersistent = computed(() => currentMode.isPersistent.value);

      watch(currentMode.name, () => {
        windowState.headerTitle = currentMode.name.value;
      });

      return {
        terrainType,
        isPersistent,
        createNew(): void {
          manager.startNew(currentMode.type!);
        },
        addToCategory(): void {
          addToCategoryCollection(category, currentMode);
          collectionComponent.selection.value =
            collectionComponent.items.value.filter(
              (i) => currentMode.name.value === i.name,
            );
        },
      };
    },
    computed: {
      types() {
        return TransparentTerrainType;
      },
    },
  });
</script>
