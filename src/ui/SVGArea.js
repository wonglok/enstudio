/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useDrag, useWheel } from "react-use-gesture";
import { ProjectContext } from "../pages/Editor";
import smalltalk from "./smalltalk/smalltalk";

const BOX_SEPERATOR = `BOX_`;
const INPUT_SEPERATOR = `_Input_`;
const OUTPUT_SEPERATOR = `_Output_`;
const CONNECTOR_RADIUS = 8;

function useWindowEvent(event, fnc) {
  useEffect(() => {
    window.addEventListener(event, fnc);
    return () => {
      window.removeEventListener(event, fnc);
    };
  });
}

function emitWindowEvent(event, detail) {
  window.dispatchEvent(new CustomEvent(event, { detail }));
}

function getSizing({ box }) {
  let fontSize = 14;
  let paddingX = 10;
  let paddingY = 8 + 10;
  let perCharWidth = 6;
  let textLength = 10;

  let boxHeight = 17;
  let boxWidth =
    paddingX + (box.inputs || []).length * (CONNECTOR_RADIUS * 2 + 5.5);

  let displayName = box.displayName || box.name;

  return {
    paddingX,
    paddingY,
    perCharWidth,
    textLength,
    fontSize,
    boxHeight,
    boxWidth,
    displayName,
  };
}

export function Box({
  box,
  state,
  graphRefresh = () => {},
  onClickOutput = () => {},
  onClickBox = () => {},
  onClickInput = () => {},
}) {
  const [rID, refresh] = useState(0);
  const { boxesUtil } = useContext(ProjectContext);

  let updateBox = ({ box }) => {
    boxesUtil.updateBox({ box });
    refresh((s) => s + rID + 1);
  };

  useWindowEvent("state-flushed-to-disk", () => {
    refresh((s) => s + rID + 1);
  });

  const [drag, setDrag] = useState({ x: box.x, y: box.y });
  const bind = useDrag(({ down, delta: [dx, dy] }) => {
    if (box.isFixed) {
      return;
    }
    if (down) {
      setDrag((s) => {
        return { ...s, x: s.x + dx, y: s.y + dy };
      });
      window.dispatchEvent(
        new CustomEvent("dragged-box", { detail: { boxID: box._id } })
      );
    } else if (!down) {
      updateBox({ box: { ...box, ...drag } });
    }
    // console.log([dx, dy])
  });

  let openFileEditor = ({ box }) => {
    var openInEditor = require("open-in-editor");
    var editor = openInEditor.configure(
      {
        // options
        editor: "code",
        pattern: "-r -g {filename}:{line}:{column}",
      },
      function (err) {
        console.error("Something went wrong: " + err);
      }
    );

    let filePath = boxesUtil.resolvePath({ box });

    editor.open(filePath).then(
      function () {
        console.log("Success!");
      },
      function (err) {
        console.error("Something went wrong: " + err);
      }
    );
  };

  const onClickEditCode = async () => {
    openFileEditor({ box });
  };

  const onClickEditIO = () => {
    window.dispatchEvent(
      new CustomEvent("provide-module-edit-window", { detail: { box } })
    );
  };

  const onClickRemoveLabel = async () => {
    smalltalk
      .confirm("Remove Box?", `"${box.displayName}"`)
      .then(() => {
        return boxesUtil.removeBox({ box });
      })
      .then(() => {
        graphRefresh((s) => s + 1);
      })
      .catch(console.log);
  };

  const onClickRename = async () => {
    boxesUtil.renameBox({ box }).catch((e) => {
      console.log(e);
    });

    // smalltalk
    //   .confirm("Remove Box?", `"${box.displayName}"`)
    //   .then(() => {
    //     return boxesUtil.removeBox({ box });
    //   })
    //   .then(() => {
    //     graphRefresh((s) => s + 1);
    //   })
    //   .catch(console.log);
  };

  let hasOutputCable = () => {
    let cables = state.cables;
    if (!cables) {
      return false;
    }
    return cables.some((e) => e.outputBoxID === box._id);
  };
  let isOutputConnected = hasOutputCable();

  let InputBalls = () => {
    let gap = 3;
    return box.inputs.map((input, index) => {
      let hasCable = () => {
        let cables = state.cables;
        return cables.some((e) => e.inputSlotID === input._id);
      };
      let isConnected = hasCable();
      return (
        <circle
          key={input._id + box._id}
          style={{ cursor: isConnected ? "" : "alias" }}
          onClick={() => {
            if (!isConnected) {
              onClickInput({
                type: "input",
                box,
                input,
                handSlotID: input._id,
              });
            }
          }}
          id={`${BOX_SEPERATOR}${box.moduleName}${INPUT_SEPERATOR}${input._id}`}
          r={CONNECTOR_RADIUS}
          cx={CONNECTOR_RADIUS * 1.5 + (CONNECTOR_RADIUS + gap) * 2.0 * index}
          cy={-CONNECTOR_RADIUS * 1.5 - 3}
          fill={isConnected ? "#77ff77" : "#ddffdd"}
          // stroke={isConnected ? "#77ff77" : "#ddffdd"}
        ></circle>
      );
    });
  };

  let [hover, setHover] = useState(false);
  useWindowEvent("hover-on-svg-area-rect", () => {
    setHover(false);
  });
  let {
    paddingX,
    // paddingY,
    // perCharWidth,
    // textLength,
    fontSize,
    boxHeight,
    boxWidth,
    displayName,
  } = getSizing({ box });

  return (
    <g transform={`translate(${drag.x}, ${drag.y})`}>
      {/* leave box */}
      {/* <rect
        x={-15 - 8}
        y={-35 - 8}
        width={100 + boxWidth + 8 + 8}
        height={155 + 8 + 8}
        rx={8}
        ry={8}
        fill={hover ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.0)"}
        onMouseEnter={() => {
          setHover(false);
        }}
        onMouseLeave={() => {
          setHover(false);
        }}
        onMouseOver={() => {
          setHover(false);
        }}
        onMouseOut={() => {
          setHover(false);
        }}
      ></rect> */}

      {/* hover box */}
      <rect
        {...bind()}
        x={-15}
        y={-35}
        width={90 + boxWidth}
        height={155}
        rx={8}
        ry={8}
        fill={hover ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.0)"}
        style={{ cursor: "move" }}
        onMouseEnter={() => {
          setHover(true);
        }}
        // onMouseLeave={() => {
        //   setHover(false);
        // }}
        onMouseOver={() => {
          setHover(true);
        }}
        // onMouseOut={() => {
        //   setHover(false);
        // }}
      ></rect>

      <text
        className="select-none"
        fill={"#ececec"}
        x={boxWidth + paddingX}
        y={-fontSize * 0.5}
        fontSize={fontSize + "px"}
      >
        {displayName}
      </text>

      {hover && (
        <g>
          <text
            onClick={onClickEditCode}
            className="select-none underline cursor-pointer"
            fill={"#ececec"}
            x={boxWidth + paddingX}
            y={fontSize + 1 + 3}
            fontSize={fontSize + "px"}
          >
            Edit JS Code
          </text>

          <text
            onClick={onClickEditIO}
            className="select-none underline cursor-pointer"
            fill={"#ececec"}
            x={boxWidth + paddingX}
            y={fontSize + 1 + fontSize + 1 + 10}
            fontSize={fontSize + "px"}
          >
            Edit I/O
          </text>

          <text
            onClick={onClickRename}
            className="select-none underline cursor-pointer"
            fill={"#ececec"}
            x={boxWidth + paddingX}
            y={fontSize + 1 + fontSize + 1 + 35}
            fontSize={fontSize + "px"}
          >
            Rename
          </text>

          {!box.isProtected && (
            <text
              onClick={onClickRemoveLabel}
              className="select-none underline cursor-pointer"
              fill={"#ffecec"}
              x={boxWidth + paddingX}
              y={fontSize + 1 + fontSize * 2 + 1 + 45}
              fontSize={fontSize + "px"}
            >
              Delete
            </text>
          )}
        </g>
      )}

      <rect
        onClick={() => onClickBox({ box })}
        className={box.isFixed ? "cursor-not-allowed" : "cursor-move"}
        {...bind()}
        fill={"url(#logo-gradient)"}
        stroke="#ececec"
        width={boxWidth}
        height={boxHeight}
        rx={8}
        ry={8}
      ></rect>

      {/* Input, Green */}
      {InputBalls()}

      {/* Output Blue */}
      <circle
        style={{ cursor: "pointer" }}
        onClick={() =>
          onClickOutput({ type: "output", box, handSlotID: "output" })
        }
        id={`${BOX_SEPERATOR}${box.moduleName}${OUTPUT_SEPERATOR}${"output"}`}
        r={CONNECTOR_RADIUS}
        cx={CONNECTOR_RADIUS * 0.0 + 0.5 * boxWidth}
        cy={CONNECTOR_RADIUS * 2 + boxHeight}
        fill={isOutputConnected ? "#7777ff" : "#ddddff"}
        stroke={isOutputConnected ? "#7777ff" : "#ddddff"}
      ></circle>

      {/* <text y={-20} fontSize={'12px'}>{JSON.stringify(box)}</text> */}
    </g>
  );
}

/**


  const pt = svg.createSVGPoint();

  // pass event coordinates
  pt.x = svg.clientX;
  pt.y = svg.clientY;

  // transform to SVG coordinates
  const svgP = pt.matrixTransform( svg.getScreenCTM().inverse() );
 */

function AutoFlipLine({
  x1,
  x2,
  y1,
  y2,
  animated = false,
  reverse = false,
  distortion = 0,
  force = false,
}) {
  let dist = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) * 0.5;
  dist += dist * distortion;

  let factorY = y1 < y2 ? 1 : -1;
  let factorX = x1 < x2 ? 1 : -1;
  let whichLine = Math.abs(y2 - y1) >= Math.abs(x2 - x1);

  let refA = useRef();
  let refB = useRef();
  if (force === "v") {
    whichLine = true;
  }
  if (force === "h") {
    whichLine = false;
  }
  let ref = whichLine ? refA : refB;

  useEffect(() => {
    let acc = 0;
    let tt = setInterval(() => {
      let factor = 1;
      if (reverse) {
        factor = -1;
      }
      if (animated && ref.current) {
        acc = acc + factor * 2.5;
        ref.current.setAttribute("stroke-dashoffset", acc);
      }
    }, 16.7);
    return () => {
      clearInterval(tt);
    };
  }, [x1, x2, y1, y2]);

  return whichLine ? (
    <path
      ref={refA}
      className={"pointer-events-none"}
      d={`
M${x1}, ${y1}

C${x1},${y1 + dist * factorY} ${x2},${y2 + dist * -factorY}

${x2},${y2}`}
      fill="none"
      stroke="#babaff"
      strokeDasharray="24"
      strokeWidth="2px"
      // strokeDashoffset={offsetAnim}
    />
  ) : (
    <path
      ref={refB}
      className={"pointer-events-none"}
      d={`
M${x1}, ${y1}

C${x1 + dist * factorX},${y1} ${x2 + dist * -factorX},${y2}

${x2},${y2}`}
      fill="none"
      stroke="#babaff"
      strokeWidth="2px"
      strokeDasharray="24"
      // strokeDashoffset={offsetAnim}
    />
  );
}

function HandLine({ svg, hand }) {
  let [[x1, y1], sxy1] = useState([0, 0]);
  let [[x2, y2], sxy2] = useState([0, 0]);

  useEffect(() => {
    let onMM = () => {
      let element = false;

      if (hand.type === "output") {
        element = svg.querySelector(
          `#${BOX_SEPERATOR}${hand.box.moduleName}${OUTPUT_SEPERATOR}${hand.handSlotID}`
        );
      } else if (hand.type === "input") {
        element = svg.querySelector(
          `#${BOX_SEPERATOR}${hand.box.moduleName}${INPUT_SEPERATOR}${hand.handSlotID}`
        );
      }

      if (!element) {
        return;
      }

      const pt = svg.createSVGPoint();
      let rPt = element.getBoundingClientRect();

      pt.y = rPt.top;
      pt.x = rPt.left;

      // transform to SVG coordinates
      const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
      sxy2([svgP.x + CONNECTOR_RADIUS, svgP.y + CONNECTOR_RADIUS]);
    };
    svg.addEventListener("mousemove", onMM);
    onMM();
    return () => {
      svg.removeEventListener("mousemove", onMM);
    };
  }, [svg, hand]);

  useEffect(() => {
    let onMM = (ev) => {
      const pt = svg.createSVGPoint();

      // pass event coordinates
      pt.x = ev.clientX;
      pt.y = ev.clientY;

      // transform to SVG coordinates
      const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());

      sxy1([svgP.x, svgP.y]);
    };
    svg.addEventListener("mousemove", onMM);

    return () => {
      svg.removeEventListener("mousemove", onMM);
    };
  }, []);

  let canShow = () => {
    return x1 + y1 !== 0;
  };

  return (
    <g>
      {canShow() && (
        <AutoFlipLine
          distortion={0}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          animated={true}
          reverse={hand.type === "input"}
        ></AutoFlipLine>
      )}
    </g>
  );
}

let LogicCable = ({
  show = ["cable", "close"],
  svg,
  state,
  cable,
  refresh = () => {},
}) => {
  let [[x1, y1], setPt1] = useState([0, 0]);
  let [[x2, y2], setPt2] = useState([0, 0]);
  let onSVGCoord = (svg, dotEl) => {
    const pt = svg.createSVGPoint();
    let rPt = dotEl.getBoundingClientRect();

    pt.y = rPt.top;
    pt.x = rPt.left;

    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
    return [svgP.x + CONNECTOR_RADIUS, svgP.y + CONNECTOR_RADIUS];
  };

  let inputBox = state.boxes.find((b) => b._id === cable.inputBoxID);
  let outputBox = state.boxes.find((b) => b._id === cable.outputBoxID);

  useEffect(() => {
    let inputSlot = inputBox.inputs.find((i) => i._id === cable.inputSlotID);
    if (!inputSlot || !outputBox || !inputBox) {
      smalltalk.confirm("remove broken lines?", "").then(() => {
        boxesUtil.removeCable({ cableID: cable._id });
        refresh((s) => s + 1);
      });
      return () => {};
    }
    let outputSlotDOM = document.querySelector(
      `#${BOX_SEPERATOR}${outputBox.moduleName}${OUTPUT_SEPERATOR}${"output"}`
    );

    let inputSlotDOM = document.querySelector(
      `#${BOX_SEPERATOR}${inputBox.moduleName}${INPUT_SEPERATOR}${inputSlot._id}`
    );

    if (outputSlotDOM && inputSlotDOM) {
      setPt1(onSVGCoord(svg, inputSlotDOM));
      setPt2(onSVGCoord(svg, outputSlotDOM));
    }

    let dragbox = ({ detail: { boxID } }) => {
      if (boxID === inputBox._id || boxID === outputBox._id) {
        if (outputSlotDOM && inputSlotDOM) {
          setPt1(onSVGCoord(svg, inputSlotDOM));
          setPt2(onSVGCoord(svg, outputSlotDOM));
        }
      }
    };
    window.addEventListener("dragged-box", dragbox);
    return () => {
      window.removeEventListener("dragged-box", dragbox);
    };
  }, [cable, inputBox, outputBox]);

  let [opacity, setOpacity] = useState(0.15);
  let { boxesUtil } = useContext(ProjectContext);

  return (
    <g>
      {show.includes("cable") && (
        <AutoFlipLine
          distortion={0}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          force={"v"}
          animated={true}
          reverse={false}
        ></AutoFlipLine>
      )}
      {show.includes("close") && (
        <g>
          <circle
            style={{ opacity: opacity - 0.05 }}
            onMouseOver={() => {
              setOpacity(1);
            }}
            onMouseLeave={() => {
              setOpacity(0.15);
            }}
            onClick={() => {
              boxesUtil.removeCable({ cableID: cable._id });
              refresh((s) => s + 1);
            }}
            fill={"#ffffff"}
            r={10}
            cx={(x1 + x2) / 2}
            cy={(y1 + y2) / 2}
          ></circle>
          <circle
            style={{ opacity: opacity }}
            onMouseOver={() => {
              setOpacity(1);
            }}
            onMouseLeave={() => {
              setOpacity(0.15);
            }}
            onClick={() => {
              boxesUtil.removeCable({ cableID: cable._id });
              refresh((s) => s + 1);
            }}
            fill={"#ee0000"}
            r={5}
            cx={(x1 + x2) / 2}
            cy={(y1 + y2) / 2}
          ></circle>
        </g>
      )}
    </g>
  );
};

export function SVGEditor({ rect, state }) {
  const svg = useRef();
  const [zoom, setZoom] = useState(1);
  const [rID, refresh] = useState(0);
  const [hand, setHandMode] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const { boxesUtil, lowdb, projectRoot } = useContext(ProjectContext);

  useEffect(() => {
    let refresher = () => {
      refresh((s) => s + 1);
    };
    window.addEventListener("refresh-main-editor", refresher);
    return () => {
      window.removeEventListener("refresh-main-editor", refresher);
    };
  }, []);

  useEffect(() => {
    function zoom(e) {
      e.preventDefault();
      if (e.ctrlKey) {
        var scaler = Math.exp(e.deltaY / 100);
        setZoom((z) => {
          return z * scaler;
        });
      }
    }
    if (!svg.current) {
      return () => {};
    }
    svg.current.addEventListener("wheel", zoom, { passive: false });
    return () => {
      if (svg.current) {
        svg.current.removeEventListener("wheel", zoom, { passive: false });
      }
    };
  });

  // const { addBox } = useWorkbench({ projectRoot: url });

  const bind = useWheel(({ wheeling, delta: [dx, dy] }) => {
    if (wheeling) {
      setPan((s) => {
        return { ...s, x: s.x + dx, y: s.y + dy };
      });
    }
  });

  let checkAddCable = ({ outputBoxID, inputBoxID, inputSlotID }) => {
    let cables = lowdb.getState().cables;

    let found = cables.find((e) => {
      return (
        e.outputBoxID === outputBoxID &&
        e.inputBoxID === inputBoxID &&
        e.inputSlotID === inputSlotID
      );
    });

    let sameSourceTarget = outputBoxID === inputBoxID;

    if (!found && !sameSourceTarget) {
      boxesUtil.addCable({ outputBoxID, inputBoxID, inputSlotID });
    }
    // console.log({ outputBoxID, inputBoxID, inputSlotID });
  };

  let onTryConnect = ({ nowClickedBox, clickedType, clickedInput }) => {
    if (hand.type === "output" && clickedType === "box") {
      let outputBox = hand.box;
      let inputBox = nowClickedBox;

      let input = inputBox.inputs[0];
      let inputSlotID = input._id;

      let outputBoxID = outputBox._id;
      let inputBoxID = inputBox._id;

      checkAddCable({ outputBoxID, inputBoxID, inputSlotID });
      setHandMode(false);
    } else if (hand.type === "input" && clickedType === "box") {
      let inputBox = hand.box;
      let outputBox = nowClickedBox;

      let input = inputBox.inputs[0];
      let inputSlotID = input._id;

      let outputBoxID = outputBox._id;
      let inputBoxID = inputBox._id;

      checkAddCable({ outputBoxID, inputBoxID, inputSlotID });
      setHandMode(false);
    } else if (hand.type === "output" && clickedType === "input") {
      let input = clickedInput;
      let inputSlotID = input._id;

      let outputBox = hand.box;
      let inputBox = nowClickedBox;

      let outputBoxID = outputBox._id;
      let inputBoxID = inputBox._id;

      checkAddCable({ outputBoxID, inputBoxID, inputSlotID });
      setHandMode(false);
    } else if (hand.type === "input" && clickedType === "output") {
      let inputBox = hand.box;
      let outputBox = nowClickedBox;

      let input = hand.input;
      let inputSlotID = input._id;

      let outputBoxID = outputBox._id;
      let inputBoxID = inputBox._id;

      checkAddCable({ outputBoxID, inputBoxID, inputSlotID });
      setHandMode(false);
    } else {
      setHandMode(false);
    }
  };

  const boxes = state.boxes.map((e) => {
    return (
      <Box
        key={e._id}
        box={e}
        state={state}
        onClickBox={({ box }) => {
          if (!hand) {
          } else {
            onTryConnect({
              nowClickedBox: box,
              clickedType: "box",
            });
          }
        }}
        onClickInput={({ type, input, box, handSlotID }) => {
          if (!hand) {
            // console.log(input);

            setHandMode(() => ({
              handSlotID,
              type,
              input,
              box: box,
              visible: true,
            }));
          } else {
            onTryConnect({
              clickedInput: input,
              nowClickedBox: box,
              clickedType: "input",
            });
          }
        }}
        onClickOutput={({ type, box, handSlotID }) => {
          if (!hand) {
            setHandMode((m) => ({
              handSlotID,
              type,
              box: box,
              visible: true,
            }));
          } else {
            onTryConnect({
              nowClickedBox: box,
              clickedType: "output",
            });
          }
        }}
        graphRefresh={refresh}
      ></Box>
    );
  });

  let Cables = () => {
    return state.cables.map((cable, index) => {
      return (
        <LogicCable
          key={cable._id + "_" + index}
          svg={svg.current}
          state={state}
          cable={cable}
          index={index}
          refresh={refresh}
          show={["cable"]}
        ></LogicCable>
      );
    });
  };

  let CloseBtns = () => {
    return state.cables.map((cable, index) => {
      return (
        <LogicCable
          key={cable._id + "_" + index}
          svg={svg.current}
          state={state}
          cable={cable}
          index={index}
          refresh={refresh}
          show={["close"]}
        ></LogicCable>
      );
    });
  };

  const addModule = async () => {
    let { box } = await boxesUtil.addBox().catch((v) => {
      console.log(v);
      return { box: false };
    });
    if (!box) {
      return;
    }
    box.x = (rect.width / 2) * 0.0 + pan.x + 50;
    box.y = (rect.height / 2) * 0.0 + pan.y + 150;

    refresh((s) => s + rID + 1);
    // addBox();
    // console.log(lowdb.get("boxes").value());
  };

  const addModuleWithConnection = async ({ position }) => {
    if (hand.type === "output") {
      let { box } = await boxesUtil.addBox().catch(() => {
        setHandMode(false);
        return { box: false };
      });

      if (!box) {
        return;
      }

      let inputBox = box;
      let inputBoxID = box._id;

      let input = inputBox.inputs[0];
      let inputSlotID = input._id;

      let outputBox = hand.box;
      let outputBoxID = outputBox._id;

      if (!outputBoxID || !inputBox || !inputSlotID) {
        return;
      }

      await boxesUtil.addCable({ outputBoxID, inputBoxID, inputSlotID });

      box.x = position.x - 50 + pan.x;
      box.y = position.y - 50 + pan.y;
      await boxesUtil.updateBox({ box });

      refresh((s) => s + rID + 1);
    } else if (hand.type === "input") {
      let { box } = await boxesUtil.addBox().catch(() => {
        setHandMode(false);
        return { box: false };
      });

      if (!box) {
        return;
      }

      let outputBox = box;
      let outputBoxID = outputBox._id;

      let inputBox = hand.box;
      let inputBoxID = inputBox._id;

      let inputSlotID = hand.handSlotID;

      if (!outputBoxID || !inputBox || !inputSlotID) {
        return;
      }

      await boxesUtil.addCable({ outputBoxID, inputBoxID, inputSlotID });

      box.x = position.x - 50 + pan.x;
      box.y = position.y - 50 + pan.y;
      await boxesUtil.updateBox({ box });

      refresh((s) => s + rID + 1);
    }

    setHandMode(false);
  };

  // let openCore = () => {
  //   // var path = require("path");
  //   var openInEditor = require("open-in-editor");
  //   var editor = openInEditor.configure(
  //     {
  //       // options
  //       editor: "code",
  //       pattern: "-r -g {filename}:{line}:{column}",
  //     },
  //     function (err) {
  //       console.error("Something went wrong: " + err);
  //     }
  //   );

  //   let box = {
  //     isEntry: true,
  //     fileName: "core.js",
  //   };

  //   let filePath = boxesUtil.resolvePath({ box });

  //   editor.open(filePath).then(
  //     function () {
  //       console.log("Success!");
  //     },
  //     function (err) {
  //       console.error("Something went wrong: " + err);
  //     }
  //   );
  // };

  useEffect(() => {
    let esc = (ev) => {
      if (ev.key === "esc" || ev.keyCode === 27) {
        setHandMode(false);
      }
    };
    window.addEventListener("keypress", esc);
    return () => {
      window.removeEventListener("keypress", esc);
    };
  });

  let openFolder = () => {
    // let { ipcRenderer } = require("electron");
    // ipcRenderer.send("open", root);
    openInFinder({ url: projectRoot });
  };

  let openInFinder = ({ url }) => {
    var gui = require("nw.gui");
    gui.Shell.openItem(url);
  };

  // let reloadSystem = () => {
  //   let nw = require("nw.gui");
  //   let win = nw.Window.get();
  //   win.close();
  // };

  let getURL = () => {
    let path = require("path");
    let fs = require("fs-extra");
    let config = fs.readJsonSync(
      path.join(projectRoot, "./src/effectnode/config.json")
    );
    let url = config.client.origin;
    return url;
  };

  let openWebPage = () => {
    let url = getURL();
    let gui = require("nw.gui");
    gui.Shell.openExternal(url);
  };

  let [online, setOnline] = useState(false);
  useEffect(() => {
    let tt = setInterval(() => {
      let url = getURL();
      if (url) {
        fetch(url).then(
          () => {
            setOnline(true);
          },
          () => {
            setOnline(false);
          }
        );
      }
    }, 10000);
    return () => {
      clearInterval(tt);
    };
  });
  return (
    <svg
      ref={svg}
      {...bind()}
      style={{
        // backgroundColor: "rgba(0,0,0,0.5)",
        cursor: hand && hand.type === "output" ? "cell" : "",
      }}
      width={rect.width}
      height={rect.height}
      viewBox={`${pan.x} ${pan.y} ${rect.width * zoom} ${rect.height * zoom}`}
    >
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#7A5FFF">
            <animate
              attributeName="stop-color"
              values="#7A5FFF; #01FF89; #7A5FFF"
              dur="4s"
              repeatCount="indefinite"
            ></animate>
          </stop>

          <stop offset="100%" stopColor="#01FF89">
            <animate
              attributeName="stop-color"
              values="#01FF89; #7A5FFF; #01FF89"
              dur="4s"
              repeatCount="indefinite"
            ></animate>
          </stop>
        </linearGradient>
      </defs>

      <rect
        onClick={async (ev) => {
          if (hand) {
            await addModuleWithConnection({
              position: { x: ev.clientX, y: ev.clientY },
            });
          } else {
          }
        }}
        onMouseEnter={() => {
          emitWindowEvent("hover-on-svg-area-rect", true);
        }}
        x={pan.x}
        y={pan.y}
        width={rect.width}
        height={rect.height}
        fill="transparent"
      ></rect>

      {svg.current && hand && (
        <HandLine svg={svg.current} hand={hand}></HandLine>
      )}

      {svg.current && Cables()}
      {boxes}
      {svg.current && CloseBtns()}

      {/* GUI */}
      <g>
        <text
          x={10 + pan.x}
          y={10 + 17 + pan.y}
          onClick={() => {
            setPan({ x: 0, y: 0 });
            setZoom(1);
          }}
          fontSize="17"
          fill="white"
          className="underline cursor-pointer"
        >
          Reset View
        </text>

        {/* <text
          x={"Reset View".length * 7 + 30 + pan.x}
          y={10 + 17 + pan.y}
          onClick={reloadSystem}
          fontSize="17"
          fill="white"
          className="underline cursor-pointer"
        >
          Reload System
        </text> */}

        <text
          x={"Reset View".length * 7 + 30 + pan.x}
          y={10 + 17 + pan.y}
          onClick={addModule}
          fontSize="17"
          fill="white"
          className="underline cursor-pointer"
        >
          Add Module
        </text>

        <text
          x={180 + 20 + pan.x}
          y={10 + 17 + pan.y}
          onClick={openFolder}
          fontSize="17"
          fill="white"
          className="underline cursor-pointer"
        >
          Locate Project
        </text>

        {/* <text
          x={380 + 20 + pan.x}
          y={10 + 17 + pan.y}
          onClick={openCore}
          fontSize="17"
          fill="white"
          className="underline cursor-pointer"
        >
          Open Core
        </text> */}

        {online && (
          <text
            x={300 + pan.x}
            y={10 + 17 + pan.y}
            onClick={openWebPage}
            fontSize="17"
            fill="white"
            className="underline cursor-pointer"
          >
            Open WebPage
          </text>
        )}
      </g>

      {/* <SlotLine></SlotLine> */}

      {/* <path
        d={`
        M${x1}, ${y1}
        C${(x2 + x1) / 2},${y1} ${(x2 + x1) / 2},${y2}  ${x2},${y2}`}
        fill="none"
        stroke="#000"
        strokeWidth="2px"
      /> */}
    </svg>
  );
}

export function SVGArea() {
  let ref = useRef();
  let { lowdb } = useContext(ProjectContext);

  let [rect, setRect] = useState(false);

  useEffect(() => {
    let rect = ref.current.getBoundingClientRect();
    setRect(rect);
  }, [!!rect]);

  useEffect(() => {
    let resizer = () => {
      let rect = ref.current.getBoundingClientRect();
      setRect(rect);
    };
    window.addEventListener("resize", resizer);
    return () => {
      window.removeEventListener("resize", resizer);
    };
  }, []);

  useLayoutEffect(() => {
    let rect = ref.current.getBoundingClientRect();
    setRect(rect);

    let relayout = ({ detail }) => {
      let rect = ref.current.getBoundingClientRect();
      setRect(rect);
    };
    window.addEventListener("relayout", relayout);
    return () => {
      window.removeEventListener("relayout", relayout);
    };
  }, []);

  return (
    <div ref={ref} className={"w-full h-full relative"}>
      {rect && <SVGEditor rect={rect} state={lowdb.getState()}></SVGEditor>}
      {/* <LogBox></LogBox> */}
      {/* {JSON.stringify(lowdb.getState())} */}
    </div>
  );
}

// function LogBox() {
//   let scroller = useRef();
//   useEffect(() => {
//     let logger = ({ detail }) => {
//       if (scroller.current) {
//         let domList = scroller.current.querySelectorAll(".MY_LOG");
//         if (domList.length >= 100) {
//           for (let i = 0; i < domList.length; i++) {
//             if (i < domList.length - 100) {
//               domList[i].remove();
//             }
//           }
//         }

//         let getColor = (type = "log") => {
//           if (type === "log") {
//             return "text-yellow-200";
//           } else if (type === "info") {
//             return "text-blue-200";
//           } else if (type === "error") {
//             return "text-red-200";
//           } else {
//             return "text-yellow-200";
//           }
//         };

//         let div = document.createElement("div");
//         div.innerHTML = `<div
//           class="MY_LOG p-1 text-sm whitespace-pre text-right ${getColor(
//             detail.type
//           )}"
//         >${detail.msg}</div>`;
//         scroller.current.appendChild(div);

//         scroller.current.scrollTop = scroller.current.scrollHeight;
//       }
//     };

//     let resetLogs = () => {
//       scroller.current.innerHTML = "";
//     };

//     resetLogs();

//     window.addEventListener("log", logger);
//     return () => {
//       window.removeEventListener("log", logger);
//     };
//   }, [scroller]);

//   return (
//     <div
//       className={"w-full absolute right-0 overflow-scroll pr-3"}
//       ref={scroller}
//       style={{ height: `250px`, width: "400px", bottom: "50px" }}
//     ></div>
//   );
// }
