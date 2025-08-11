import type { ShallowRef } from 'vue';
import { shallowRef } from 'vue';
import type { Projection } from '@vcmap/core';
import { getDefaultProjection } from '@vcmap/core';
import { Feature } from 'ol';
import { Polygon } from 'ol/geom.js';
import type { VcsUiApp } from '@vcmap/ui';

export enum TransparentTerrainType {
  Box = 'Box',
  Rectangle = 'Rectangle',
  Global = 'Global',
}

class TerrainMode {
  app: VcsUiApp;

  type?: TransparentTerrainType;

  protected _initialized: boolean;

  protected _active: boolean;

  readonly projection: Projection;

  name: ShallowRef<string | undefined>;

  isPersistent: ShallowRef<boolean | undefined>;

  constructor(app: VcsUiApp) {
    this.app = app;
    this.type = undefined;
    this._initialized = false;
    this._active = false;
    this.name = shallowRef(undefined);
    this.isPersistent = shallowRef(false);
    this.projection = getDefaultProjection();
  }

  initialize(): void {
    if (!this._initialized) {
      this._initialized = true;
    }
  }

  activate(): void {
    if (!this._active) {
      this.initialize();
      this._active = true;
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
    this._active = false;
  }
}
export default TerrainMode;
