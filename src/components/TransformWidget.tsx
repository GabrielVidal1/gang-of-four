import { useState } from "react";
import { Transform } from "../types/config";

interface TransformWidgetProps {
  name?: string;
  transform: Transform;
  onChange: (transform: Transform) => void;
}

const TransformWidget: React.FC<TransformWidgetProps> = ({
  name,
  transform,
  onChange,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-4 border rounded-lg bg-gray-100">
      <div className="flex items-center justify-center">
        <h2 className="font-bold mb-4 flex-1">Transform {name}</h2>
        <button
          className="p-1 bg-blue-200 text-white rounded-lg"
          onClick={() => setOpen(!open)}
        >
          {open ? "-" : "+"}
        </button>
      </div>

      {open && (
        <>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Scale:</h3>
            <input
              type="range"
              min={0.5}
              max={2}
              step={0.01}
              value={transform.scale}
              onChange={(event) =>
                onChange({
                  ...transform,
                  scale: parseFloat(event.target.value),
                })
              }
            />
          </div>

          <div className="mb-4">
            <h3 className="font-semibold mb-2">X Offset:</h3>
            <input
              type="range"
              min={0.5}
              max={1.5}
              step={0.01}
              value={transform.offsetX}
              onChange={(event) =>
                onChange({
                  ...transform,
                  offsetX: parseFloat(event.target.value),
                })
              }
            />
          </div>

          <div className="mb-4">
            <h3 className="font-semibold mb-2">Y Offset:</h3>
            <input
              type="range"
              min={0.2}
              max={1.7}
              step={0.01}
              value={transform.offsetY}
              onChange={(event) =>
                onChange({
                  ...transform,
                  offsetY: parseFloat(event.target.value),
                })
              }
            />
          </div>

          <div className="mb-4">
            <h3 className="font-semibold mb-2">Rotation:</h3>
            <input
              type="range"
              min={-180}
              max={180}
              value={transform.rotation}
              onChange={(event) =>
                onChange({
                  ...transform,
                  rotation: parseInt(event.target.value),
                })
              }
            />
          </div>
        </>
      )}
    </div>
  );
};

export default TransformWidget;
