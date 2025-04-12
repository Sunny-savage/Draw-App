import { Tool } from "../Components/Canvas";
import { getExistingShapes } from "./http";

type Shape =
  | {
      type: "rect";
      x: number;
      y: number;
      height: number;
      width: number;
    }
  | {
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
    }
  | {
      type: "pencil";
      coordinate: coordinate[];
    };

type coordinate = {
  x: number;
  y: number;
};
export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private roomId: string;
  private existingShapes: Shape[];
  private socket: WebSocket;
  private clicked: boolean;
  private startX = 0;
  private startY = 0;
  public selectedTool: Tool = "pan";

  private currentPath: coordinate[];
  private offsetX = 0;
  private offsetY = 0;
  private scale = 1;

  constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.existingShapes = [];
    this.roomId = roomId;
    this.socket = socket;
    this.clicked = false;
    this.currentPath = [];

    this.init();

    this.initHandlers();
    this.initMouseHandlers();
  }
  setTool(tool: Tool) {
    console.log(tool);
    this.selectedTool = tool;
    console.log(
      this.selectedTool,
      this,
      "what is thsis ",
      "this selectedtool",
      this
    );
  }
  async init() {
    this.existingShapes = await getExistingShapes(this.roomId);
    this.applyPanAndRedraw();
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);

    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);

    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);

    // this.socket.close();
  }

  initHandlers() {
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type == "chat") {
        const parsedData = JSON.parse(message.message);
        this.existingShapes.push(parsedData.shape);
        this.applyPanAndRedraw();
      }
    };
  }

  clearCanvas() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transforms

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // Clear everything
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  mouseUpHandler = (e: MouseEvent) => {
    this.clicked = false;
    const adjustedX = (e.offsetX - this.offsetX) / this.scale;
    const adjustedY = (e.offsetY - this.offsetY) / this.scale;

    const width = adjustedX - this.startX;
    const height = adjustedY - this.startY;
    let shape: Shape | null = null;

    console.log(
      this.selectedTool,
      "selected tool",
      new Date().toLocaleTimeString()
    );
    if (this.selectedTool === "rect") {
      console.log("rect", this, new Date().toLocaleTimeString());
      shape = {
        type: "rect",
        x: this.startX,
        y: this.startY,
        height: height,
        width: width,
      };
    } else if (this.selectedTool === "circle") {
      console.log("cicle", this, new Date().toLocaleTimeString());
      const dx = adjustedX - this.startX;
      const dy = adjustedY - this.startY;
      const radius = Math.sqrt(dx * dx + dy * dy);
      shape = {
        type: "circle",
        centerX: this.startX,
        centerY: this.startY,
        radius: radius,
      };
    } else if (this.selectedTool === "pencil") {
      shape = {
        type: "pencil",
        coordinate: this.currentPath,
      };
      this.currentPath = [];
    }

    if (!shape) {
      return;
    }
    this.existingShapes.push(shape);

    this.socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify({ shape }),
        roomId: this.roomId,
      })
    );
  };

  mouseDownHandler = (e: MouseEvent) => {
    this.clicked = true;

    if (this.selectedTool === "pan") {
      // For panning, use raw mouse position
      this.startX = e.clientX;
      this.startY = e.clientY;
    } else {
      // For drawing tools, adjust based on pan offset
      const adjustedX = (e.offsetX - this.offsetX) / this.scale;
      const adjustedY = (e.offsetY - this.offsetY) / this.scale;

      this.startX = adjustedX;
      this.startY = adjustedY;

      if (this.selectedTool === "pencil") {
        console.log("this is pencil in mouse down");
        this.currentPath = [{ x: adjustedX, y: adjustedY }];
        this.ctx.beginPath();
        this.ctx.moveTo(adjustedX, adjustedY);
      }
    }
  };

  mouseMoveHandler = (e: MouseEvent) => {
    if (this.clicked) {
      const adjustedX = (e.offsetX - this.offsetX) / this.scale;
      const adjustedY = (e.offsetY - this.offsetY) / this.scale;

      const width = adjustedX - this.startX;
      const height = adjustedY - this.startY;
      const selectedTool = this.selectedTool;

      this.ctx.strokeStyle = "rgba(255,255,255)";
      if (selectedTool === "pencil") {
        console.log("this si pencill in mousemove");
        this.currentPath.push({ x: adjustedX, y: adjustedY });
        this.ctx.lineTo(adjustedX, adjustedY);
        this.ctx.stroke();

        return;
      }

      if (selectedTool === "pan") {
        const dx = e.clientX - this.startX;
        const dy = e.clientY - this.startY;

        this.offsetX += dx;
        this.offsetY += dy;

        this.startX = e.clientX;
        this.startY = e.clientY;

        this.applyPanAndRedraw();

        return;
      }

      this.applyPanAndRedraw();

      //@ts-ignore
      if (selectedTool === "rect") {
        this.ctx.strokeRect(this.startX, this.startY, width, height);
      } else if (selectedTool === "circle") {
        const dx = adjustedX - this.startX;
        const dy = adjustedY - this.startY;
        const radius = Math.sqrt(dx * dx + dy * dy);
        this.ctx.beginPath();
        this.ctx.arc(this.startX, this.startY, radius, 0, 2 * Math.PI);
        this.ctx.stroke();
        this.ctx.closePath();
      }
    }
  };

  handleWheel = (e: WheelEvent) => {
    e.preventDefault();

    const zoomIntensity = 0.1;
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;

    const zoom = e.deltaY < 0 ? 1 + zoomIntensity : 1 - zoomIntensity;

    // World position before zoom
    const worldX = (mouseX - this.offsetX) / this.scale;
    const worldY = (mouseY - this.offsetY) / this.scale;

    // Apply zoom
    this.scale *= zoom;

    // Adjust offset to keep mouse focus
    this.offsetX = mouseX - worldX * this.scale;
    this.offsetY = mouseY - worldY * this.scale;

    this.applyPanAndRedraw();
  };
  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);

    this.canvas.addEventListener("mouseup", this.mouseUpHandler);

    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);

    this.canvas.addEventListener("wheel", this.handleWheel, { passive: false });
  }

  applyPanAndRedraw() {
    this.clearCanvas(); // Clean up first
    this.ctx.setTransform(
      this.scale,
      0,
      0,
      this.scale,
      this.offsetX,
      this.offsetY
    ); // Apply scale + pan

    this.drawAll(); // Draw shapes in new view
  }

  drawAll() {
    this.existingShapes.map((shape) => {
      if (shape.type === "rect") {
        this.ctx.strokeStyle = "rgba(255,255,255)";

        this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === "circle") {
        this.ctx.strokeStyle = "rgba(255,255,255)";

        this.ctx.beginPath();

        this.ctx.arc(
          shape.centerX,
          shape.centerY,
          shape.radius,
          0,
          Math.PI * 2
        );
        this.ctx.stroke();
        this.ctx.closePath();
      } else if (shape.type === "pencil") {
        this.ctx.strokeStyle = "rgba(255,255,255)";

        this.ctx.beginPath();
        const [start, ...rest] = shape.coordinate;
        this.ctx.moveTo(start.x, start.y);
        for (const point of rest) {
          this.ctx.lineTo(point.x, point.y);
        }
        this.ctx.stroke();
      }
    });
  }
}
