<template>
  <v-sheet class="hide-scrollbar">
    <v-row no-gutters class="py-0 px-1">
      <VcsCheckbox
        v-model="moveCameraUnderTerrain"
        :label="$t('transparentTerrain.settings.global.camera')"
      />
    </v-row>
    <v-row no-gutters class="py-0 px-1">
      <v-col>
        <VcsLabel>
          {{ $t('transparentTerrain.settings.global.opacity') }}
        </VcsLabel>
      </v-col>
      <v-col class="d-flex justify-end">
        <VcsLabel> {{ opacity }} % </VcsLabel>
      </v-col>
    </v-row>
    <v-row no-gutters class="py-0 px-1">
      <vcs-slider
        v-model.number="opacity"
        type="number"
        step="1"
        :disabled="useOpacityByDistance"
      />
    </v-row>
    <VcsFormSection
      :expandable="true"
      heading="transparentTerrain.settings.global.nearFar"
    >
      <v-row no-gutters class="py-1 px-3">
        <v-switch
          v-model="useOpacityByDistance"
          :label="$t('transparentTerrain.settings.global.distanceOpacity')"
        />
      </v-row>
      <v-row no-gutters class="py-0 px-1">
        <v-col>
          <VcsLabel>
            {{ $t('transparentTerrain.settings.global.near') }}
          </VcsLabel>
        </v-col>
        <v-col class="d-flex justify-end">
          <VcsTextField
            v-model.number="opacityByDistance.near"
            type="number"
            :disabled="!useOpacityByDistance"
            hide-spin-buttons
            unit="m"
          />
        </v-col>
      </v-row>
      <v-row no-gutters class="py-0 px-1">
        <v-col>
          <VcsLabel>
            {{ $t('transparentTerrain.settings.global.nearOpacity') }}
          </VcsLabel>
        </v-col>
        <v-col class="d-flex justify-end">
          <VcsLabel :disabled="!useOpacityByDistance">
            {{ opacityByDistance.nearValue }} %
          </VcsLabel>
        </v-col>
      </v-row>
      <v-row no-gutters class="py-0 px-1">
        <vcs-slider
          v-model.number="opacityByDistance.nearValue"
          type="number"
          step="1"
          :disabled="!useOpacityByDistance"
        />
      </v-row>
      <v-row no-gutters class="py-0 px-1">
        <v-col>
          <VcsLabel>
            {{ $t('transparentTerrain.settings.global.far') }}
          </VcsLabel>
        </v-col>
        <v-col class="d-flex justify-end">
          <VcsTextField
            v-model.number="opacityByDistance.far"
            type="number"
            :disabled="!useOpacityByDistance"
            hide-spin-buttons
            unit="m"
          />
        </v-col>
      </v-row>
      <v-row no-gutters class="py-0 px-1">
        <v-col>
          <VcsLabel>
            {{ $t('transparentTerrain.settings.global.farOpacity') }}
          </VcsLabel>
        </v-col>
        <v-col class="d-flex justify-end">
          <VcsLabel :disabled="!useOpacityByDistance">
            {{ opacityByDistance.farValue }} %
          </VcsLabel>
        </v-col>
      </v-row>
      <v-row no-gutters class="py-0 px-1">
        <vcs-slider
          v-model.number="opacityByDistance.farValue"
          type="number"
          step="1"
          :disabled="!useOpacityByDistance"
        />
      </v-row>
    </VcsFormSection>
  </v-sheet>
</template>
<script lang="ts">
  import {
    VcsCheckbox,
    VcsFormSection,
    VcsLabel,
    VcsSlider,
    VcsTextField,
  } from '@vcmap/ui';
  import { VRow, VCol, VSheet, VSwitch } from 'vuetify/components';
  import { computed, defineComponent, inject } from 'vue';
  import type TransparentTerrainManager from '../transparentTerrainManager.js';
  import type GlobalTerrainMode from '../mode/globalTerrainMode.js';

  export default defineComponent({
    name: 'GlobalTerrainComponent',
    components: {
      VcsFormSection,
      VSwitch,
      VcsSlider,
      VcsCheckbox,
      VcsLabel,
      VRow,
      VCol,
      VSheet,
      VcsTextField,
    },
    setup() {
      const manager = inject<TransparentTerrainManager>('manager')!;
      const terrainMode = manager.currentMode.value! as GlobalTerrainMode;

      const { collision, opacity, opacityByDistance, useOpacityByDistance } =
        terrainMode;

      const moveCameraUnderTerrain = computed({
        get() {
          return !collision.value;
        },
        set(value) {
          collision.value = !value;
        },
      });

      return {
        moveCameraUnderTerrain,
        opacity,
        opacityByDistance,
        useOpacityByDistance,
      };
    },
  });
</script>
<style lang="scss" scoped>
  :deep(.vcs-text-field input) {
    text-align: right;
  }
</style>
