import { Vector2D } from "./Vector2D.js";

export const circleIntersectsSegment = (circle, segment) => {
  let closest;

  const segA = new Vector2D(segment.p1.x, segment.p1.y);
  const segB = new Vector2D(segment.p2.x, segment.p2.y);
  const circlePos = new Vector2D(circle.x, circle.y);

  const segV = Vector2D.subtract(segB, segA);
  const angleBetweenSegVAndXAxis = Math.atan2();
  const ptV = Vector2D.subtract(circlePos, segA);

  const projVLength = Vector2D.dot(ptV, Vector2D.unit(segV));
  if (Math.abs(projVLength) < 0)
    closest = segA;
  if (Math.abs(projVLength) > Math.abs(segV))
    closest = segB;

  const projV = Vector2D.multiply(Vector2D.unit(segV), Math.abs(projVLength));

  closest = Vector2D.add(segA, projV);

  const distV = Vector2D.subtract(closest, circlePos);
  const distVLength = distV.length();

  const offset = Vector2D.multiply(Vector2D.divide(distV, distVLength), circle.radius - distVLength);

  return offset.length();
}

export const calcAngleBetweenPoints = (p1, p2) => Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;

export const pointIntersectsCircle = (point, circle) => {
  return Math.sqrt(
    (point.x - circle.x) ** 2 +
    (point.y - circle.y) ** 2
  ) < circle.radius;
}
