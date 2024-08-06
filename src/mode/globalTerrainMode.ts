import { Color, NearFarScalar } from '@vcmap-cesium/engine';
import { reactive, ShallowRef, shallowRef, UnwrapRef, watch } from 'vue';
import { Feature } from 'ol';
import { VcsUiApp } from '@vcmap/ui';
import { CesiumMap } from '@vcmap/core';
import TerrainMode, { TransparentTerrainType } from './terrainMode.js';

export type GlobalTerrainValues = {
  opacity: number;
  useOpacityByDistance: boolean;
  opacityByDistance: OpacityByDistance;
  collision: boolean;
};

export type OpacityByDistance = {
  near: number;
  nearValue: number;
  far: number;
  farValue: number;
};

class GlobalTerrainMode extends TerrainMode {
  readonly opacity: ShallowRef<number>;

  readonly useOpacityByDistance: ShallowRef<boolean>;

  opacityByDistance: UnwrapRef<OpacityByDistance>;

  readonly collision: ShallowRef<boolean>;

  // eslint-disable-next-line class-methods-use-this
  private opacityWatcher: () => void = () => {};

  // eslint-disable-next-line class-methods-use-this
  private useOpacityByDistanceWatcher: () => void = () => {};

  // eslint-disable-next-line class-methods-use-this
  private opacityByDistanceWatcher: () => void = () => {};

  // eslint-disable-next-line class-methods-use-this
  private collisionWatcher: () => void = () => {};

  constructor(app: VcsUiApp) {
    super(app);
    this.type = TransparentTerrainType.Global;
    this.opacity = shallowRef(GlobalTerrainMode.getDefaultOptions().opacity);
    this.useOpacityByDistance = shallowRef(
      GlobalTerrainMode.getDefaultOptions().useOpacityByDistance,
    );
    this.opacityByDistance = reactive(
      GlobalTerrainMode.getDefaultOptions().opacityByDistance,
    );
    this.collision = shallowRef(
      GlobalTerrainMode.getDefaultOptions().collision,
    );
  }

  static getDefaultOptions(): GlobalTerrainValues {
    return {
      opacity: 50,
      useOpacityByDistance: false,
      opacityByDistance: {
        near: 200,
        nearValue: 50,
        far: 2000,
        farValue: 100,
      },
      collision: false,
    };
  }

  initialize(): void {
    if (!this.initialized) {
      super.initialize();
      (
        this.app.maps.activeMap as CesiumMap
      ).getScene()!.globe.undergroundColor = Color.WHITE;
      (
        this.app.maps.activeMap as CesiumMap
      ).getScene()!.screenSpaceCameraController.enableCollisionDetection =
        this.collision.value;
    }
  }

  activate(): void {
    if (!this.active) {
      super.activate();
      (
        this.app.maps.activeMap as CesiumMap
      ).getScene()!.globe.translucency.enabled = true;
      this.opacityWatcher = watch(
        this.opacity,
        this.applyOpacitySettings.bind(this),
      );
      this.useOpacityByDistanceWatcher = watch(
        this.useOpacityByDistance,
        this.applyOpacitySettings.bind(this),
      );
      this.opacityByDistanceWatcher = watch(
        this.opacityByDistance,
        this.applyOpacitySettings.bind(this),
      );
      this.collisionWatcher = watch(this.collision, () => {
        (
          this.app.maps.activeMap as CesiumMap
        ).getScene()!.screenSpaceCameraController.enableCollisionDetection =
          this.collision.value;
      });
      this.applyOpacitySettings();
    }
  }

  applyOpacitySettings(): void {
    if (this.useOpacityByDistance.value) {
      (
        this.app.maps.activeMap as CesiumMap
      ).getScene()!.globe.translucency.frontFaceAlphaByDistance =
        new NearFarScalar(
          this.opacityByDistance.near,
          this.opacityByDistance.nearValue / 100,
          this.opacityByDistance.far,
          this.opacityByDistance.farValue / 100,
        );
      (
        this.app.maps.activeMap as CesiumMap
      ).getScene()!.globe.translucency.frontFaceAlpha = 1.0;
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      (
        this.app.maps.activeMap as CesiumMap
      ).getScene()!.globe.translucency.frontFaceAlphaByDistance = undefined;
      (
        this.app.maps.activeMap as CesiumMap
      ).getScene()!.globe.translucency.frontFaceAlpha =
        this.opacity.value / 100;
    }
  }

  serialize(): Feature {
    const feature = super.serialize();
    feature.set('opacity', this.opacity.value);
    feature.set('useOpacityByDistance', this.useOpacityByDistance.value);
    feature.set('opacityByDistance', this.opacityByDistance);
    feature.set('collision', this.collision.value);
    return feature;
  }

  deserialize(feature: Feature): void {
    super.deserialize(feature);
    this.opacity.value =
      feature.get('opacity') || GlobalTerrainMode.getDefaultOptions().opacity;
    this.useOpacityByDistance.value =
      feature.get('useOpacityByDistance') ||
      GlobalTerrainMode.getDefaultOptions().useOpacityByDistance;
    this.opacityByDistance = reactive(
      feature.get('opacityByDistance') ||
        GlobalTerrainMode.getDefaultOptions().opacityByDistance,
    );
    this.collision.value =
      feature.get('collision') ||
      GlobalTerrainMode.getDefaultOptions().collision;
  }

  deactivate(): void {
    if (this.active) {
      super.deactivate();
      this.opacityWatcher();
      this.useOpacityByDistanceWatcher();
      this.opacityByDistanceWatcher();
      this.collisionWatcher();
      if (this.app.maps.activeMap instanceof CesiumMap) {
        this.app.maps.activeMap.getScene()!.globe.translucency.enabled = false;
      }
    }
  }
}
export default GlobalTerrainMode;
