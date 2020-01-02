/*
 * 2D Vector class
 */
export function Vector2D(x, y) {
  this.x = x || 0;
  this.y = y || 0;
}

Vector2D.prototype.length = function() { return Math.sqrt(Vector2D.dot(this, this)) };

Vector2D.add = function(a, b) { if (b instanceof Vector2D) return new Vector2D(a.x + b.x, a.y + b.y);
  else return new Vector2D(a.x + b, a.y + b);
};
Vector2D.subtract = function(a, b) {
  if (b instanceof Vector2D) return new Vector2D(a.x - b.x, a.y - b.y);
  else return new Vector2D(a.x - b, a.y - b);
};
Vector2D.multiply = function(a, b) {
  if (b instanceof Vector2D) return new Vector2D(a.x * b.x, a.y * b.y);
  else return new Vector2D(a.x * b, a.y * b);
};
Vector2D.divide = function(a, b) {
  if (b instanceof Vector2D) return new Vector2D(a.x / b.x, a.y / b.y);
  else return new Vector2D(a.x / b, a.y / b);
};
Vector2D.equals = function(a, b) {
  return a.x == b.x && a.y == b.y;
};
Vector2D.dot = function(a, b) {
  return a.x * b.x + a.y * b.y;
};
Vector2D.unit = function(a) {
  const magnitude = Math.sqrt(a.x * a.x + a.y * a.y);

  return new Vector2D(a.x / magnitude, a.y / magnitude);
}



