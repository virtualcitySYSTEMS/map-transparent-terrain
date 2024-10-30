import { ShallowRef, shallowRef } from 'vue';
import { getDefaultProjection, Projection } from '@vcmap/core';
import { Feature } from 'ol';
import { Polygon } from 'ol/geom.js';
import { VcsUiApp } from '@vcmap/ui';

export enum TransparentTerrainType {
  Box = 'Box',
  Rectangle = 'Rectangle',
  Global = 'Global',
}

class TerrainMode {
  app: VcsUiApp;

  type?: TransparentTerrainType;

  protected initialized: boolean;

  protected active: boolean;

  readonly projection: Projection;

  name: ShallowRef<string | undefined>;

  isPersistent: ShallowRef<boolean | undefined>;

  constructor(app: VcsUiApp) {
    this.app = app;
    this.type = undefined;
    this.initialized = false;
    this.active = false;
    this.name = shallowRef(undefined);
    this.isPersistent = shallowRef(false);
    this.projection = getDefaultProjection();
  }

  initialize(): void {
    if (!this.initialized) {
      this.initialized = true;
    }
  }

  activate(): void {
    if (!this.active) {
      this.initialize();
      this.active = true;
    }
  }

  serialize(): Feature {
    const feature = new Feature();
    feature.setGeometry(new Polygon([]));
    feature.set('name', this.name.value);
    feature.set('type', this.type);
    return feature;
  }

  deserialize(feature: Feature): void {
    this.name.value = feature.get('name');
  }

  deactivate(): void {
    this.active = false;
  }
}
export default TerrainMode;
