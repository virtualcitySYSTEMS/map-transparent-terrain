<template>
  <v-sheet class="hide-scrollbar">
    <GlobalTerrainComponent
      v-if="terrainType === TransparentTerrainType.Global"
    />
    <RectangleTerrainComponent
      v-if="terrainType === TransparentTerrainType.Rectangle"
    />
    <BoxTerrainComponent v-if="terrainType === TransparentTerrainType.Box" />
    <v-divider class="mt-3" />
    <div class="d-flex w-100 justify-space-between px-2 pt-2 pb-1">
      <VcsFormButton
        icon="$vcsComponentsPlus"
        @click="addToCategory"
        :disabled="isPersistent"
        :tooltip="'transparentTerrain.create.tooltip.addToWorkspace'"
      />
      <VcsFormButton
        variant="filled"
        :disabled="terrainType === TransparentTerrainType.Global"
        @click="createNew"
        >{{ $t('transparentTerrain.create.new') }}</VcsFormButton
      >
    </div>
  </v-sheet>
</template>
<script lang="ts">
  import {
    CollectionComponentClass,
    VcsFormButton,
    WindowState,
  } from '@vcmap/ui';
  import { VSheet, VDivider } from 'vuetify/components';
  import { inject, computed, defineComponent, watch } from 'vue';
  import { Category } from '@vcmap/core';
  import GlobalTerrainComponent from './GlobalTerrainComponent.vue';
  import { TransparentTerrainType } from '../mode/terrainMode.js';
  import BoxTerrainComponent from './BoxTerrainComponent.vue';
  import TransparentTerrainManager from '../transparentTerrainManager.js';
  import {
    addToCategoryCollection,
    TransparentTerrainItem,
  } from '../category/transparentTerrainCategory.js';
  import RectangleTerrainComponent from './RectangleTerrainComponent.vue';

  export default defineComponent({
    name: 'TerrainWindow',
    props: {
      itemName: {
        type: String,
        required: false,
        default: undefined,
      },
    },
    computed: {
      TransparentTerrainType() {
        return TransparentTerrainType;
      },
    },
    components: {
      BoxTerrainComponent,
      VDivider,
      RectangleTerrainComponent,
      GlobalTerrainComponent,
      VSheet,
      VcsFormButton,
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
  });
</script>
