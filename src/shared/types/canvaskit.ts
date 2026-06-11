export type Color = Float32Array;
export type Rect = Float32Array;

export interface Deletable {
  delete(): void;
}

export interface Path extends Deletable {}

export interface Paint extends Deletable {
  setStyle(style: unknown): void;
  setColor(color: Color): void;
  setAntiAlias(value: boolean): void;
  setStrokeWidth(width: number): void;
  setAlphaf(alpha: number): void;
}

export interface Canvas {
  save(): void;
  restore(): void;
  clear(color: Color): void;
  concat(matrix: number[]): void;
  drawPath(path: Path, paint: Paint): void;
  drawImageRect(image: Image, source: Rect, dest: Rect, paint: Paint): void;
}

export interface Image extends Deletable {}

export interface Surface extends Deletable {
  getCanvas(): Canvas;
  flush(): void;
}

export interface PathBuilder extends Deletable {
  addRect(rect: Rect, isCCW?: boolean): PathBuilder;
  addCircle(x: number, y: number, r: number, isCCW?: boolean): PathBuilder;
  addOval(oval: Rect, isCCW?: boolean): PathBuilder;
  addRRect(rrect: Rect, isCCW?: boolean): PathBuilder;
  addPolygon(points: number[] | Float32Array, close: boolean): PathBuilder;
  moveTo(x: number, y: number): PathBuilder;
  lineTo(x: number, y: number): PathBuilder;
  close(): PathBuilder;
  snapshot(): Path;
}

export interface PDFDocument extends Deletable {
  beginPage(width: number, height: number): Canvas;
  endPage(): void;
  close(): Uint8Array;
}

export interface CanvasKit {
  Paint: new () => Paint;
  PathBuilder: new () => PathBuilder;
  PaintStyle: { Fill: unknown; Stroke: unknown };
  Color4f(r: number, g: number, b: number, a: number): Color;
  XYWHRect(x: number, y: number, w: number, h: number): Rect;
  RRectXY(rect: Rect, rx: number, ry: number): Rect;
  MakeSWCanvasSurface(canvas: HTMLCanvasElement): Surface | null;
  MakeImageFromCanvasImageSource(source: CanvasImageSource): Image | null;
  MakePDFDocument(metadata: Record<string, string>): PDFDocument;
}
