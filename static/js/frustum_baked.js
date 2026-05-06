/** addInstantFrustums — precomputed JSON frustums */
import * as THREE from 'three';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';

export function addInstantFrustums(
  parent,
  fin,
  data,
  colorsHex,
  resolution,
  lineWidthWorld = 0.015,
) {
  const views = data[String(fin)];
  if (!views || views.length !== 5) return;
  const res = resolution.clone();

  for (let j = 0; j < 5; j++) {
    const v = views[j];
    const lineGeo = new LineSegmentsGeometry();
    lineGeo.setPositions(v.linePos);
    const lineMat = new LineMaterial({
      color: colorsHex[j],
      linewidth: lineWidthWorld,
      worldUnits: true,
      resolution: res,
      depthTest: true,
      transparent: true,
      opacity: 0.96,
    });
    const lines = new LineSegments2(lineGeo, lineMat);
    lines.computeLineDistances();
    lines.renderOrder = 2;
    parent.add(lines);

    const fillGeo = new THREE.BufferGeometry();
    fillGeo.setAttribute('position', new THREE.Float32BufferAttribute(v.fillPos, 3));
    fillGeo.setIndex(v.fillIdx);
    fillGeo.computeVertexNormals();
    const fillCol = new THREE.Color(colorsHex[j]).multiplyScalar(0.18);
    const fillMesh = new THREE.Mesh(
      fillGeo,
      new THREE.MeshLambertMaterial({
        color: fillCol,
        transparent: true,
        opacity: 0.34,
        side: THREE.DoubleSide,
        depthWrite: true,
      }),
    );
    fillMesh.castShadow = true;
    fillMesh.receiveShadow = false;
    fillMesh.renderOrder = 1;
    parent.add(fillMesh);
  }
}
