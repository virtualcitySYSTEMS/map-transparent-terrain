import { CesiumMap, Extent, wgs84Projection } from '@vcmap/core';
import { Rectangle } from '@vcmap-cesium/engine';
import type { Feature } from 'ol';
import type { VcsUiApp } from '@vcmap/ui';
import { TransparentTerrainType } from './terrainMode.js';
import GlobalTerrainMode from './globalTerrainMode.js';

class RectangleTerrainMode extends GlobalTerrainMode {
  private _extent?: Array<number>;

  constructor(app: VcsUiApp) {
    super(app);
    this.type = TransparentTerrainType.Rectangle;
    this._extent = undefined;
  }

  // eslint-disable-next-line class-methods-use-this
  get defaultExtent(): Array<number> {
    return [-180, -90, 180, 90];
  }

  extentNotEqual(): boolean {
    if (!this._extent) {
      return true;
    } else {
      return (
        this._extent.length !== this.defaultExtent.length ||
        !this._extent.every(
          (value, index) => value === this.defaultExtent[index],
        )
      );
    }
  }

  initialize(): void {
    if (!this._initialized) {
      super.initialize();
      if (!this._extent) {
        this._extent = this.defaultExtent;
      }
    }
  }

  activate(): void {
    if (!this._active) {
      super.activate();
      if (this.extentNotEqual()) {
        (
          this.app.maps.activeMap as CesiumMap
        ).getScene()!.globe.translucency.rectangle = Rectangle.fromDegrees(
          ...this._extent!,
        );
      } else {
        (
          this.app.maps.activeMap as CesiumMap
        ).getScene()!.globe.translucency.rectangle = Rectangle.fromDegrees();
      }
    }
  }

  getExtent(): Extent {
    return new Extent({
      projection: wgs84Projection.toJSON(),
      coordinates: this._extent,
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
      this._extent = extent.extent;
      (
        this.app.maps.activeMap as CesiumMap
      ).getScene()!.globe.translucency.rectangle = Rectangle.fromDegrees(
        ...this._extent,
      );
    }
  }

  serialize(): Feature {
    const feature = super.serialize();
    feature.set('_extent', this._extent);
    return feature;
  }

  deserialize(feature: Feature): void {
    super.deserialize(feature);
    this._extent = feature.get('_extent');
  }

  deactivate(): void {
    if (this._active) {
      super.deactivate();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (this.app.maps.activeMap instanceof CesiumMap) {
        this.app.maps.activeMap.getScene()!.globe.translucency.rectangle =
          Rectangle.fromDegrees(...this.defaultExtent);
      }
    }
  }
}
export default RectangleTerrainMode;
