import { CesiumMap, Extent, wgs84Projection } from '@vcmap/core';
import { Rectangle } from '@vcmap-cesium/engine';
import { Feature } from 'ol';
import { VcsUiApp } from '@vcmap/ui';
import { TransparentTerrainType } from './terrainMode.js';
import GlobalTerrainMode from './globalTerrainMode.js';

class RectangleTerrainMode extends GlobalTerrainMode {
  private extent?: Array<number>;

  constructor(app: VcsUiApp) {
    super(app);
    this.type = TransparentTerrainType.Rectangle;
    this.extent = undefined;
  }

  // eslint-disable-next-line class-methods-use-this
  get defaultExtent(): Array<number> {
    return [0, 0, 1e-10, 1e-10];
  }

  initialize(): void {
    if (!this.initialized) {
      super.initialize();
      if (!this.extent) {
        this.extent = this.defaultExtent;
      }
    }
  }

  activate(): void {
    if (!this.active) {
      super.activate();
      (
        this.app.maps.activeMap as CesiumMap
      ).getScene()!.globe.translucency.rectangle = Rectangle.fromDegrees(
        ...this.extent!,
      );
    }
  }

  getExtent(): Extent {
    return new Extent({
      projection: wgs84Projection.toJSON(),
      coordinates: this.extent,
    });
  }

  getDefaultExtent(): Extent {
    return new Extent({
      projection: wgs84Projection.toJSON(),
      coordinates: this.defaultExtent,
    });
  }

  updateExtent(extent: Extent): void {
    if (extent) {
      this.extent = extent.extent;
      (
        this.app.maps.activeMap as CesiumMap
      ).getScene()!.globe.translucency.rectangle = Rectangle.fromDegrees(
        ...this.extent,
      );
    }
  }

  serialize(): Feature {
    const feature = super.serialize();
    feature.set('extent', this.extent);
    return feature;
  }

  deserialize(feature: Feature): void {
    super.deserialize(feature);
    this.extent = feature.get('extent');
  }

  deactivate(): void {
    if (this.active) {
      super.deactivate();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      (
        this.app.maps.activeMap as CesiumMap
      ).getScene()!.globe.translucency.rectangle = undefined;
    }
  }
}
export default RectangleTerrainMode;