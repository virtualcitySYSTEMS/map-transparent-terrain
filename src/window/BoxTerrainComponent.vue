<template>
  <v-sheet class="hide-scrollbar">
    <div>
      <v-row no-gutters class="py-2 px-2">
        {{ $t('transparentTerrain.settings.box.hint') }}
      </v-row>
    </div>
    <v-divider />
    <v-row no-gutters class="py-0 px-1">
      <v-col>
        <VcsLabel> {{ $t('transparentTerrain.settings.geometry') }} </VcsLabel>
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col class="py-0 px-1">
        <VcsTextField
          id="length"
          type="number"
          step="10"
          :prefix="$t('transparentTerrain.settings.length')"
          v-model.number="localBoxSize.x"
        />
      </v-col>
      <v-col class="py-0 px-1">
        <VcsTextField
          id="width"
          type="number"
          step="10"
          :prefix="$t('transparentTerrain.settings.width')"
          v-model.number="localBoxSize.y"
        />
      </v-col>
      <v-col class="py-0 px-1">
        <VcsTextField
          id="depth"
          type="number"
          step="10"
          :prefix="$t('transparentTerrain.settings.depth')"
          v-model.number="localBoxSize.z"
        />
      </v-col>
    </v-row>
    <v-divider class="mt-3" />
    <v-row no-gutters class="py-0 px-1">
      <v-col>
        <VcsLabel> {{ $t('transparentTerrain.settings.position') }} </VcsLabel>
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col class="py-0 px-1">
        <VcsTextField
          id="coordinateX"
          type="number"
          step="10"
          prefix="X"
          :decimals="2"
          v-model.number="boxPosition.x"
        />
      </v-col>
      <v-col class="py-0 px-1">
        <VcsTextField
          id="coordinateY"
          type="number"
          step="10"
          prefix="Y"
          :decimals="2"
          v-model.number="boxPosition.y"
        />
      </v-col>
    </v-row>
    <v-row no-gutters class="py-0 px-1">
      <v-switch
        v-model="showTexture"
        :label="$t('transparentTerrain.settings.box.showTexture')"
      />
    </v-row>
  </v-sheet>
</template>
<script lang="ts">
  import { VcsLabel, VcsTextField } from '@vcmap/ui';
  import { VRow, VCol, VSheet, VDivider, VSwitch } from 'vuetify/lib';
  import { defineComponent, inject, reactive, shallowRef, watch } from 'vue';
  import { Cartesian3 } from '@vcmap-cesium/engine';
  import TransparentTerrainManager from '../transparentTerrainManager.js';
  import BoxTerrainMode from '../mode/boxTerrainMode.js';

  export default defineComponent({
    name: 'BoxTerrainComponent',
    components: {
      VSwitch,
      VcsTextField,
      VcsLabel,
      VRow,
      VCol,
      VSheet,
      VDivider,
    },
    setup() {
      const manager = inject<TransparentTerrainManager>('manager')!;
      const currentMode = manager.currentMode.value! as BoxTerrainMode;
      const { projectPosition } = currentMode;
      const boxPosition = reactive(projectPosition.value.clone());
      const localBoxSize = reactive(currentMode.boxSize.clone());
      const showTexture = shallowRef(currentMode.showTexture);

      if (currentMode) {
        watch(projectPosition, () => {
          Cartesian3.clone(projectPosition.value, boxPosition);
        });
        watch(boxPosition, () => {
          if (
            Number.isFinite(boxPosition.x) &&
            Number.isFinite(boxPosition.y) &&
            Number.isFinite(boxPosition.z)
          ) {
            currentMode.updateBox(localBoxSize, boxPosition, showTexture.value);
          }
        });
        watch(localBoxSize, () => {
          if (
            Number.isFinite(localBoxSize.x) &&
            Number.isFinite(localBoxSize.y) &&
            Number.isFinite(localBoxSize.z) &&
            localBoxSize.x > 0 &&
            localBoxSize.y > 0 &&
            localBoxSize.y > 0
          ) {
            currentMode.updateBox(localBoxSize, boxPosition, showTexture.value);
          }
        });
        watch(showTexture, () => {
          currentMode.updateBox(localBoxSize, boxPosition, showTexture.value);
        });
      }

      return {
        localBoxSize,
        boxPosition,
        showTexture,
      };
    },
  });
</script>
