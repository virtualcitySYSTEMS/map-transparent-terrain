import {
  CallbackProperty,
  Cartesian2,
  Cartesian3,
  ImageMaterialProperty,
  JulianDate,
  Matrix4,
  Cartographic,
  ClippingPlaneCollection,
  ClippingPlane,
  Color,
  Ellipsoid,
  Plane,
  Entity,
} from '@vcmap-cesium/engine';
import type { CesiumMap, DataSourceLayer } from '@vcmap/core';
import {
  cartesianToMercator,
  ClippingObject,
  EventType,
  mercatorProjection,
  Projection,
  wgs84Projection,
} from '@vcmap/core';
import type { Ref } from 'vue';
import { ref } from 'vue';
import type { Feature } from 'ol';
import type { Coordinate } from 'ol/coordinate';
import type { VcsUiApp } from '@vcmap/ui';
import { getPluginAssetUrl } from '@vcmap/ui';
import { name } from '../../package.json';
import TransparentTerrainInteraction from '../interaction/transparentTerrainInteraction.js';
import TerrainMode, { TransparentTerrainType } from './terrainMode.js';

let modelMatrix = new Matrix4();

class BoxTerrainMode extends TerrainMode {
  private _material?: ImageMaterialProperty;

  private _clippingObject?: ClippingObject;

  private _entities: Array<Entity>;

  layer?: DataSourceLayer;

  position: Cartesian3;

  projectPosition: Ref<Cartesian3>;

  boxSize: Cartesian3;

  showTexture: boolean;

  // eslint-disable-next-line class-methods-use-this
  private _removeInteraction: () => void = () => {};

  private readonly _interaction: TransparentTerrainInteraction;

  constructor(app: VcsUiApp) {
    super(app);
    this.type = TransparentTerrainType.Box;
    this._material = undefined;
    this._clippingObject = undefined;
    this._entities = [];
    this.position = new Cartesian3();
    this.projectPosition = ref(new Cartesian3());
    this.boxSize = new Cartesian3(100, 100, 50);
    this.showTexture = true;
    this._interaction = new TransparentTerrainInteraction(
      this.translatePosition.bind(this),
    );
  }

  initialize(): void {
    if (!this._initialized) {
      super.initialize();
      this._material = new ImageMaterialProperty({
        image: getPluginAssetUrl(this.app, name, 'plugin-assets/dirt_0.png')!,
        repeat: new Cartesian2(
          Math.ceil(this.boxSize.x / 20),
          Math.ceil(this.boxSize.y / 20),
        ),
      });
    }
  }

  activate(): void {
    if (!this._active) {
      super.activate();
      if (!this._clippingObject) {
        this._clippingObject = new ClippingObject({ terrain: true });
      }
      if (this.position.equals(new Cartesian3())) {
        const cartographic = (this.app.maps.activeMap as CesiumMap)
          .getScene()!
          .camera.positionCartographic.clone();
        cartographic.height = 0;
        this.position = Cartographic.toCartesian(
          cartographic,
          (this.app.maps.activeMap as CesiumMap).getScene()!.globe.ellipsoid,
          this.position,
        );
      }
      this.projectPosition.value = this.getProjectPosition();
      this.initClippingPlanes();
      const { eventHandler } = this.app.maps;
      this._removeInteraction = eventHandler.addExclusiveInteraction(
        this._interaction,
        () => {},
      );
      this.app.maps.clippingObjectManager.setExclusiveClippingObjects(
        [this._clippingObject],
        () => {
          this.deactivate();
        },
      );
    }
  }

  initClippingPlanes(): void {
    const bottom = new Entity({
      id: 'transparentTerrainBox_bottom',
      // eslint-disable-next-line
      // @ts-ignore
      position: new CallbackProperty(() => {
        return this.position;
      }, false),
      plane: {
        plane: new CallbackProperty(() => {
          return new Plane(Cartesian3.UNIT_Z, this.boxSize.z / 2);
        }, false),
        dimensions: new CallbackProperty(() => {
          return new Cartesian2(this.boxSize.x, this.boxSize.y);
        }, false),
        material: this._material,
      },
    });
    const wall1 = new Entity({
      id: 'transparentTerrainBox_wall1',
      // eslint-disable-next-line
      // @ts-ignore
      position: new CallbackProperty(() => {
        return this.position;
      }, false),
      plane: {
        plane: new CallbackProperty(() => {
          return new Plane(Cartesian3.UNIT_Y, this.boxSize.y / 2);
        }, false),
        dimensions: new CallbackProperty(() => {
          return new Cartesian2(this.boxSize.x, this.boxSize.z);
        }, false),
        material: this._material,
      },
    });
    const wall2 = new Entity({
      id: 'transparentTerrainBox_wall2',
      // eslint-disable-next-line
      // @ts-ignore
      position: new CallbackProperty(() => {
        return this.position;
      }, false),
      plane: {
        plane: new CallbackProperty(() => {
          return new Plane(Cartesian3.UNIT_Y, -this.boxSize.y / 2);
        }, false),
        dimensions: new CallbackProperty(() => {
          return new Cartesian2(this.boxSize.x, this.boxSize.z);
        }, false),
        material: this._material,
      },
    });
    const wall3 = new Entity({
      id: 'transparentTerrainBox_wall3',
      // eslint-disable-next-line
      // @ts-ignore
      position: new CallbackProperty(() => {
        return this.position;
      }, false),
      plane: {
        plane: new CallbackProperty(() => {
          return new Plane(Cartesian3.UNIT_X, this.boxSize.x / 2);
        }, false),
        dimensions: new CallbackProperty(() => {
          return new Cartesian2(this.boxSize.y, this.boxSize.z);
        }, false),
        material: this._material,
      },
    });
    const wall4 = new Entity({
      id: 'transparentTerrainBox_wall4',
      // eslint-disable-next-line
      // @ts-ignore
      position: new CallbackProperty(() => {
        return this.position;
      }, false),
      plane: {
        plane: new CallbackProperty(() => {
          return new Plane(Cartesian3.UNIT_X, -this.boxSize.x / 2);
        }, false),
        dimensions: new CallbackProperty(() => {
          return new Cartesian2(this.boxSize.y, this.boxSize.z);
        }, false),
        material: this._material,
      },
    });
    this._entities = [bottom, wall1, wall2, wall3, wall4];
    this._entities.forEach((entity) => this.layer?.addEntity(entity));
    modelMatrix = bottom.computeModelMatrix(JulianDate.now());
    this.updateClippingPlaner();
  }

  updateClippingPlaner(): void {
    this._entities.forEach((entity) => {
      // eslint-disable-next-line
      // @ts-ignore
      entity.plane.material.color = this.showTexture
        ? Color.WHITE
        : Color.BLACK;
    });
    const dimX = this.boxSize.x / 2.0;
    const dimY = this.boxSize.y / 2.0;
    const dimZ = Math.abs(this.boxSize.z);
    this._clippingObject!.clippingPlaneCollection = new ClippingPlaneCollection(
      {
        modelMatrix,
        planes: [
          new ClippingPlane(new Cartesian3(1.0, 0.0, 0.0), -dimX),
          new ClippingPlane(new Cartesian3(-1.0, 0.0, 0.0), -dimX),
          new ClippingPlane(new Cartesian3(0.0, 1.0, 0.0), -dimY),
          new ClippingPlane(new Cartesian3(0.0, -1.0, 0.0), -dimY),
          new ClippingPlane(new Cartesian3(0.0, 0.0, -1.0), -dimZ),
        ],
        edgeWidth: 1.0,
        edgeColor: Color.WHITE,
        enabled: true,
      },
    );
  }

  updateBox(
    boxSize: Cartesian3,
    projectPosition: Cartesian3,
    showTexture: boolean,
  ): void {
    Cartesian3.clone(boxSize, this.boxSize);
    this.showTexture = showTexture;
    const wgs84Position = Projection.transform(
      wgs84Projection,
      this.projection,
      [projectPosition.x, projectPosition.y, projectPosition.z],
    );
    this.updatePosition(wgs84Position);
  }

  getProjectPosition(): Cartesian3 {
    const projectPosition = Cartesian3.fromArray(
      Projection.transform(
        this.projection,
        mercatorProjection,
        cartesianToMercator(this.position),
      ),
    );
    projectPosition.z += this.boxSize.z / 2;
    return projectPosition;
  }

  updatePosition(position: Coordinate): void {
    const [lon, lat, h] = position;
    this.position = Cartesian3.fromDegrees(
      lon,
      lat,
      h - this.boxSize.z / 2,
      Ellipsoid.WGS84,
      this.position,
    );
    Matrix4.setTranslation(modelMatrix, this.position, modelMatrix);
    this.updateClippingPlaner();
  }

  translatePosition(position: Coordinate): void {
    this.updatePosition(Projection.mercatorToWgs84(position, false));
    this.projectPosition.value = this.getProjectPosition();
  }

  serialize(): Feature {
    const feature = super.serialize();
    feature.set('position', [
      this.position.x,
      this.position.y,
      this.position.z,
    ]);
    feature.set('boxSize', [this.boxSize.x, this.boxSize.y, this.boxSize.z]);
    feature.set('showTexture', this.showTexture);
    return feature;
  }

  deserialize(feature: Feature): void {
    super.deserialize(feature);
    this.position = Cartesian3.fromArray(feature.get('position'));
    this.boxSize = Cartesian3.fromArray(feature.get('boxSize'));
    this.showTexture = !!feature.get('showTexture');
    this._interaction.paused = true;
    this._interaction.setActive(EventType.CLICK);
  }

  deactivate(): void {
    if (this._active) {
      super.deactivate();
      this._removeInteraction();
      this._entities.forEach((entity) =>
        this.layer?.removeEntityById(entity.id),
      );
      this.app.maps.clippingObjectManager.clearExclusiveClippingObjects(true);
      this._clippingObject = undefined;
    }
  }
}

export default BoxTerrainMode;
