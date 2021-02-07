/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useMemo, useState } from "react";
import { ProjectContext } from "../pages/Editor";
import smalltalk from "./smalltalk/smalltalk";
import { getID } from "../server/codebox";

function ColorPicker({ data, send }) {
  const [color, setColor] = useState(data.value || "#ffffff");
  const [name, setName] = useState(data.name);
  return (
    <div className={"flex"}>
      <input
        type="text"
        value={name}
        className="border-b mr-3"
        onChange={(ev) => {
          data.name = ev.target.value;
          setName(data.name);
          send();
        }}
      />

      <input
        type="text"
        value={color}
        onChange={(ev) => {
          data.value = ev.target.value;
          setColor(ev.target.value);
          send();
        }}
      />

      <input
        type="color"
        value={color}
        onChange={(ev) => {
          data.value = ev.target.value;
          setColor(ev.target.value);
          send();
        }}
      />
    </div>
  );
}

function NumberInput({ data, send }) {
  const [number, setValue] = useState(data.value || 0);
  const [name, setName] = useState(data.name);

  return (
    <div className={"flex"}>
      <input
        type="text"
        value={name}
        className="border-b mr-3"
        onChange={(ev) => {
          data.name = ev.target.value;
          setName(data.name);
          send();
        }}
      />

      <input
        style={{ width: "50px" }}
        type="text"
        value={number}
        onChange={(ev) => {
          data.value = parseFloat(ev.target.value);
          setValue(parseFloat(ev.target.value));
          send();
        }}
      ></input>

      <input
        min="-100"
        max="100"
        step="0.1"
        type="range"
        value={number}
        onChange={(ev) => {
          data.value = parseFloat(ev.target.value);
          setValue(parseFloat(ev.target.value));
          send();
        }}
      />
    </div>
  );
}

function InputPicker({ data, send, refresh }) {
  return (
    <div>
      <div className={"m-2"}>Choose a Input Type</div>
      <button
        onClick={() => {
          data.type = "color";
          send();
          refresh();
        }}
        className={"block m-2 underline"}
      >
        Color
      </button>
      <button
        onClick={() => {
          data.type = "number";
          send();
          refresh();
        }}
        className={"block m-2 underline"}
      >
        Number
      </button>
    </div>
  );
}

function GeneralPicker({ data, send }) {
  const [, refreshFnc] = useState(0);
  let refresh = () => refreshFnc((s) => s + 1);

  return (
    <div className="flex">
      {data.type === "color" && (
        <ColorPicker refresh={refresh} data={data} send={send}></ColorPicker>
      )}
      {data.type === "number" && (
        <NumberInput refresh={refresh} data={data} send={send}></NumberInput>
      )}
      {data.type === "ready" && (
        <InputPicker refresh={refresh} data={data} send={send}></InputPicker>
      )}
    </div>
  );
}

function UserData({ box, win }) {
  const { boxesUtil } = useContext(ProjectContext);
  const [, refresh] = useState(0);

  useEffect(() => {
    box.userData = box.userData.filter((e) => {
      return e;
    });
    boxesUtil.updateBox({ box });
  }, [box.userData.filter((e) => !e).length]);

  let userData = box.userData;

  let send = () => {
    boxesUtil.updateBox({ box });
    // window.dispatchEvent(new CustomEvent("save-state-now"));
    window.dispatchEvent(new CustomEvent("try-save-state"));
    // window.dispatchEvent(new CustomEvent("stream-state-to-webview"));
  };

  let onAdd = async () => {
    box.userData.push({
      _id: getID(),
      name: "ui" + (box.userData.length + 1),
      type: "ready",
    });
    boxesUtil.updateBox({ box });
    refresh((s) => s + 1);
  };

  let onRemove = async ({ idx }) => {
    box.userData.splice(idx, 1);
    boxesUtil.updateBox({ box });
    refresh((s) => s + 1);
  };

  let Pickers = () => {
    return userData
      .filter((e) => {
        return e;
      })
      .map((u, idx, array) => {
        return (
          <tr key={u._id}>
            <td className={"p-2 px-8  border-b border"}>
              <div>
                <GeneralPicker data={u} send={send}></GeneralPicker>
              </div>
            </td>
            <td
              className={
                "p-2 px-3 border-b border bg-indigo-400 text-white cursor-pointer select-none"
              }
              onClick={() => {
                onRemove({ idx, array });
              }}
            >
              Remove
            </td>
          </tr>

          // <div>
          // </div>
        );
      });
  };
  return (
    <div>
      <table className={"rounded-2xl shadow-2xl overflow-hidden bg-white"}>
        <thead></thead>
        <tbody>
          <tr>
            <td
              onClick={() => {
                onAdd();
              }}
              colSpan={2}
              className={
                " rounded-t-2xl py-2 text-center bg-blue-500 text-white cursor-pointer select-none px-6"
              }
            >
              Add User Data
            </td>
          </tr>
          {Pickers()}
        </tbody>
      </table>
    </div>
  );
}

function IOTable({ boxID, win, children }) {
  const { boxesUtil, lowdb } = useContext(ProjectContext);
  const [, refresh] = useState(0);

  useEffect(() => {
    let reload = () => {
      refresh((s) => s + 1);
    };
    window.addEventListener("reload-page", reload);
    return () => {
      window.removeEventListener("reload-page", reload);
    };
  }, []);

  const box = useMemo(() => {
    let boxoutput = lowdb.getState().boxes.find((b) => b._id === boxID);
    if (!boxoutput) {
      window.dispatchEvent(
        new CustomEvent("close-window", { detail: { win: win } })
      );
    }
    return boxoutput;
  });

  let onRemove = async ({ input, idx, array }) => {
    if (!hasCable(input._id)) {
      console.log("remove");
      smalltalk
        .confirm("Remove input?", input.name || "")
        .then(async () => {
          await boxesUtil.removeInputByInputID({
            boxID: box._id,
            inputID: input._id,
          });
          refresh((s) => s + 1);
          window.dispatchEvent(
            new CustomEvent("refresh-main-editor", { detail: {} })
          );
        })
        .catch(() => {});
    } else {
      // disconnect
      smalltalk
        .confirm("Disconnect input?", input.name || "")
        .then(async () => {
          await boxesUtil.disconnectCableByBoxInput({ inputID: input._id });
          refresh((s) => s + 1);
          window.dispatchEvent(
            new CustomEvent("refresh-main-editor", { detail: {} })
          );
        })
        .catch(() => {});
    }
  };

  let onAdd = async ({ array }) => {
    console.log("add");
    smalltalk
      .prompt("Add a new input", "Please give it a new name.", "pulse")
      .then(
        (value) => {
          array.push({
            _id: getID(),
            name: value,
          });
          boxesUtil.updateBox({ box });
          refresh((s) => s + 1);
          window.dispatchEvent(
            new CustomEvent("refresh-main-editor", { detail: {} })
          );
        },
        () => {}
      );
  };

  let onRename = async ({ input, idx, array }) => {
    smalltalk
      .prompt("rename connector?", input.name || "", input.name || "")
      .then(async (value) => {
        input.name = value;
        await boxesUtil.updateBox({ box });
        refresh((s) => s + 1);
      })
      .catch(console.log);
  };

  let hasCable = (inputSlotID) => {
    return lowdb.getState().cables.find((b) => b.inputSlotID === inputSlotID);
  };

  let getRemoveBtnInfo = ({ input, idx }) => {
    let show = true;

    let classNames =
      idx === box.inputs.length - 1
        ? "p-2 px-3 text-white select-none rounded-br-2xl "
        : "p-2 px-3 text-white select-none ";

    let title = ``;
    if (hasCable(input._id)) {
      classNames += " bg-purple-500 cursor-pointer";
      title = `Disconnect`;
    } else {
      classNames += " bg-red-500 cursor-pointer";
      title = `Remove`;
    }
    if (box.inputs.length === 1) {
      show = false;
    }
    return {
      show,
      title,
      classNames,
    };
  };

  return (
    <div className={"p-5"}>
      {box && (
        <div>
          <h1 className={"mb-3 text-xl"}>Box: {box.displayName}</h1>
          <div className={"mb-4"}>
            <UserData box={box}></UserData>
          </div>
          <div className={" "}>
            <table className={"rounded-2xl shadow-2xl bg-white"}>
              <thead></thead>
              <tbody>
                <tr>
                  <td
                    onClick={() => {
                      onAdd({ box, array: box.inputs });
                    }}
                    colSpan={3}
                    className={
                      " rounded-t-2xl py-2 text-center bg-blue-500 text-white cursor-pointer select-none"
                    }
                  >
                    Add Connector
                  </td>
                </tr>

                {box.inputs.map((i, idx) => {
                  return (
                    <tr key={idx}>
                      <td className={"p-2 px-8  border-b border"}>{i.name}</td>
                      <td
                        onClick={() => {
                          onRename({ idx, input: i, array: box.inputs });
                        }}
                        className={
                          "p-2 px-3 border-b border bg-indigo-400 text-white cursor-pointer select-none"
                        }
                      >
                        Rename
                      </td>
                      {getRemoveBtnInfo({ idx, input: i }).show && (
                        <td
                          className={
                            getRemoveBtnInfo({ idx, input: i }).classNames
                          }
                          onClick={() =>
                            onRemove({ input: i, idx, array: box.inputs })
                          }
                        >
                          {box.inputs.length > 1 && (
                            <span className={"capitalize"}>
                              {getRemoveBtnInfo({ idx, input: i }).title}
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* <pre>{JSON.stringify(box.inputs, null, 4)}</pre>
      <div>{box.displayName}</div> */}
    </div>
  );
}

export function IOEdit({ boxID, win }) {
  return (
    <div className={"h-full w-full overflow-y-scroll"}>
      <IOTable boxID={boxID} win={win}></IOTable>
    </div>
  );
}
