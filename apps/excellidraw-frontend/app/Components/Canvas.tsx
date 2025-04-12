import { useEffect, useRef, useState } from "react";

import { IconButton } from "./IconButton";
import {
  Circle,
  PanelTopInactiveIcon,
  Pencil,
  RectangleHorizontalIcon,
} from "lucide-react";
import { Game } from "../draw/Game";
export type Tool = "rect" | "pencil" | "circle" | "pan";
export function Canvas({
  roomId,
  socket,
}: {
  roomId: string;
  socket: WebSocket;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTool, setSelectedTool] = useState<Tool>("pan");
  const [game, setGame] = useState<Game>();

  useEffect(() => {
    console.log(selectedTool);
    game?.setTool(selectedTool);
  }, [selectedTool, game]);

  useEffect(() => {
    if (canvasRef.current) {
      const g = new Game(canvasRef.current, roomId, socket);
      setGame(g);

      return () => {
        g.destroy();
      };
    }
  }, [canvasRef]);

  return (
    <div className="h-screen overflow-hidden">
      <canvas
        className="block"
        ref={canvasRef}
        height={window.innerHeight}
        width={window.innerWidth}
      ></canvas>
      <TopBar selectedTool={selectedTool} setSelectedTool={setSelectedTool} />
    </div>
  );
}

function TopBar({
  selectedTool,
  setSelectedTool,
}: {
  selectedTool: Tool;
  setSelectedTool: (s: Tool) => void;
}) {
  return (
    <div className="fixed  top-10 left-10">
      <div className="flex mt-2 gap-2 ">
        <IconButton
          activated={selectedTool === "pencil"}
          icon={<Pencil />}
          onClick={() => {
            setSelectedTool("pencil");
          }}
        ></IconButton>
        <IconButton
          icon={<RectangleHorizontalIcon />}
          activated={selectedTool === "rect"}
          onClick={() => {
            setSelectedTool("rect");
          }}
        ></IconButton>

        <IconButton
          activated={selectedTool === "circle"}
          icon={<Circle />}
          onClick={() => {
            setSelectedTool("circle");
          }}
        ></IconButton>

        <IconButton
          activated={selectedTool === "pan"}
          icon={<PanelTopInactiveIcon />}
          onClick={() => {
            setSelectedTool("pan");
          }}
        ></IconButton>
      </div>
    </div>
  );
}
