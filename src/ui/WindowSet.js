import { useContext, useEffect, useState } from "react";
import { useDrag } from "react-use-gesture";
import { ProjectContext } from "../pages/Editor";

const getZMax = ({ wins }) => {
  let zidx = wins.map((e, i) => e.zIndex || i);
  if (zidx.length === 0) {
    zidx = [1];
  }
  let max = Math.max(...zidx) || 1;
  if (max === Infinity) {
    max = 1;
  }
  return max;
};

export function WindowTemplate({
  blur = false,
  children,
  toolBarClassName = " ",
  initVal,
  showToolBtn = true,
  onChange = () => {},
}) {
  const { useWinBox } = useContext(ProjectContext);
  const winboxes = useWinBox((s) => s.winboxes);

  const [rect, set] = useState(initVal || { x: 0, y: 0, w: 100, h: 100 });
  const toolbar = useDrag(({ down, delta: [dx, dy] }) => {
    if (down) {
      set((s) => ({ ...s, x: s.x + dx, y: s.y + dy }));
    }
    if (!down) {
      onChange(rect);
      // onZIndex();
    }
  });

  useEffect(() => {
    set(initVal);
  }, [initVal]);

  const resizerBR = useDrag(({ down, delta: [dx, dy] }) => {
    if (down) {
      set((s) => {
        let output = {
          ...s,
          w: (Number(rect.w + 0) + dx).toFixed(1),
          h: (Number(rect.h + 0) + dy).toFixed(1),
        };
        if (output.w < 100) {
          output.w = 100;
        }
        if (output.h < 100) {
          output.h = 100;
        }
        return output;
      });
    }
    if (!down) {
      onChange(rect);
    }
  });

  const resizerBL = useDrag(({ down, delta: [dx, dy] }) => {
    if (down) {
      set((s) => {
        let output = {
          ...s,
          x: rect.x + dx,
          w: (Number(rect.w + 0) - dx).toFixed(1),
          h: (Number(rect.h + 0) + dy).toFixed(1),
        };
        if (output.w < 100) {
          output.w = 100;
          output.x -= dx;
        }
        if (output.h < 100) {
          output.h = 100;
        }
        return output;
      });
    }
    if (!down) {
      onChange(rect);
    }
  });

  const hide = () => {
    onChange({ ...rect, hidden: true });
    window.dispatchEvent(new CustomEvent("reload-all-module-winbox"));
  };

  const close = () => {
    window.dispatchEvent(
      new CustomEvent("close-window", { detail: { win: rect } })
    );
  };

  const onZIndex = () => {
    let max = getZMax({ wins: winboxes }) + 2;

    //
    set((s) => {
      onChange({ ...s, zIndex: max });
      return { ...s, zIndex: max };
    });
    // window.dispatchEvent(new CustomEvent("relayout-zindex"));
  };

  return (
    <div
      onMouseDown={onZIndex}
      className={
        " absolute group top-0 left-0 text-black overflow-hidden rounded-lg shadow-xl"
      }
      style={{
        zIndex: 10 + (rect.zIndex || 0),

        width: `${rect.w}px`,
        height: `${rect.h}px`,
        // borderColor: "#003E42",
        transform: `translate3d(${rect.x}px, ${rect.y}px, 0px)`,
      }}
    >
      <div
        style={{
          height: 25 + "px",
        }}
        className={
          "w-full px-1 text-sm flex justify-between items-center cursor-move bg-green-500 text-white bg-opacity-90" +
          toolBarClassName
        }
        {...toolbar()}
      >
        <div>{initVal.name}</div>
        {showToolBtn && (
          <div className={"flex"}>
            <div
              className="h-4 w-4 mr-1 rounded-full bg-yellow-500 cursor-pointer"
              onClick={() => {
                hide();
              }}
            ></div>
            <div
              className="h-4 w-4 rounded-full mr-1 bg-red-500 cursor-pointer"
              onClick={() => {
                close();
              }}
            ></div>
          </div>
        )}
      </div>
      <div
        className="relative "
        style={{
          backdropFilter: blur ? `blur(7px)` : ``,
          height: `${rect.h - 25}px`,
          backgroundColor: blur ? `rgba(255,255,255,0.65)` : `rgb(255,255,255)`,
        }}
      >
        {children}
      </div>

      <div
        style={{ zIndex: 10000000 }}
        className=" transition-opacity duration-500 opacity-0 group-hover:opacity-100 rounded-full w-3 h-3 absolute bottom-1 right-1 bg-blue-500 cursor-move"
        {...resizerBR()}
      ></div>

      <div
        style={{ zIndex: 10000000 }}
        className=" transition-opacity duration-500 opacity-0 group-hover:opacity-100 rounded-full w-3 h-3 absolute bottom-1 left-1 bg-blue-500 cursor-move"
        {...resizerBL()}
      ></div>
    </div>
  );
}

export function WindowSet() {
  return <div></div>;
}
