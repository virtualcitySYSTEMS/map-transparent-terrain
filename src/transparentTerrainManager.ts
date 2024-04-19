import { ShallowRef, shallowRef } from 'vue';
import { DataSourceLayer, markVolatile } from '@vcmap/core';

import { Feature } from 'ol';
import { VcsUiApp } from '@vcmap/ui';
import GlobalTerrainMode from './mode/globalTerrainMode.js';
import RectangleTerrainMode from './mode/rectangleTerrainMode.js';
import TerrainMode, { TransparentTerrainType } from './mode/terrainMode.js';
import BoxTerrainMode from './mode/boxTerrainMode.js';

class TransparentTerrainManager {
  readonly app: VcsUiApp;

  private boxLayer?: DataSourceLayer;

  currentMode: ShallowRef<TerrainMode | undefined>;

  constructor(app: VcsUiApp) {
    this.app = app;
    this.boxLayer = undefined;
    this.currentMode = shallowRef(undefined);
  }

  initializeBoxLayer(): void {
    this.boxLayer = new DataSourceLayer({
      name: '_boxTransparentTerrainLayer',
    });
    markVolatile(this.boxLayer);
    this.app.layers.add(this.boxLayer);
    this.boxLayer.activate().catch(() => {});
  }

  start(mode: TerrainMode | undefined): void {
    if (mode && mode !== this.currentMode.value) {
      if (this.currentMode.value) {
        this.currentMode.value.deactivate();
      }
      this.currentMode.value = mode;
    }
    if (this.currentMode.value) {
      this.currentMode.value.activate();
    }
  }

  startNew(type: TransparentTerrainType): void {
    if (this.currentMode.value) {
      this.currentMode.value.deactivate();
    }
    this.currentMode.value = this.create(type);
    this.start(undefined);
  }

  create(type: TransparentTerrainType): TerrainMode | undefined {
    let terrainMode;

    if (type === TransparentTerrainType.Box) {
      if (!this.boxLayer) {
        this.initializeBoxLayer();
      }
      terrainMode = new BoxTerrainMode(this.app);
      terrainMode.layer = this.boxLayer;
    } else if (type === TransparentTerrainType.Global) {
      terrainMode = new GlobalTerrainMode(this.app);
    } else if (type === TransparentTerrainType.Rectangle) {
      terrainMode = new RectangleTerrainMode(this.app);
    }

    return terrainMode;
  }

  createFromFeature(feature: Feature): TerrainMode | undefined {
    const terrainMode = this.create(feature.get('type'));
    if (terrainMode) {
      terrainMode.deserialize(feature);
    }
    return terrainMode;
  }

  stop(): void {
    if (this.currentMode.value) {
      this.currentMode.value.deactivate();
      this.currentMode.value = undefined;
    }
  }
}
export default TransparentTerrainManager;
