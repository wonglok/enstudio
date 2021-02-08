import { useEffect } from "react";
import slugify from "slugify";
const _ = window.require("lodash");
const smalltalk = require("../ui/smalltalk/smalltalk");
let path = window.require("path");
export const getID = () => `_${(Math.random() * 100000000).toFixed(0)}`;
let fs = window.require("fs-extra");

function makeSlug(str) {
  return slugify(str, {
    replacement: "_", // replace spaces with replacement character, defaults to `-`
    lower: true, // convert to lower case, defaults to `false`
    strict: true, // strip special characters except replacement, defaults to `false`
  });
}

export const useBoxes = ({ db, root }) => {
  let saveInstant = (json) => {
    // let tag = moment().format('YYYY-MM-DD__[time]__hh-mm-ss-a') + '__randomID_' + getID()
    fs.writeFileSync(
      path.join(root, "./src/effectnode/js/meta.json"),
      JSON.stringify(json, null, "\t"),
      "utf-8"
    );
    // window.dispatchEvent(new CustomEvent("try-bundle"));
    // window.dispatchEvent(new CustomEvent("state-flushed-to-disk"));
  };

  useEffect(() => {
    let saver = _.debounce(
      () => {
        saveInstant(db.getState());
      },
      2500,
      { leading: true, trailing: false }
    );

    // let saveNow = () => {
    //   saveInstant(db.getState());
    // };
    window.addEventListener("try-save-state", saver);
    // window.addEventListener("save-state-now", saveNow);
    return () => {
      window.removeEventListener("try-save-state", saver);
      // window.removeEventListener("save-state-now", saveNow);
    };
  });

  const updateBox = async ({ box }) => {
    db.get("boxes")
      .find((e) => e._id === box._id)
      .assign(box)
      .write();

    window.dispatchEvent(new Event("try-save-state"));
    window.dispatchEvent(new Event("stream-state-to-webview"));
  };

  const renameBox = async ({ box }) => {
    let displayName = await smalltalk.prompt(
      "Please enter a new name for your box.",
      "Example: mybox"
    );
    box.displayName = displayName;
    updateBox({ box });
  };

  const sepToken = `__ID__`;

  const addBox = async () => {
    const state = db.getState();
    const boxes = state.boxes;

    let _id = getID();

    let displayName = await smalltalk.prompt(
      "Please enter name for your new box.",
      "Example: newbox"
    );
    let tempName = displayName || "box";
    let slug = makeSlug(tempName);

    let moduleName = `${slug}${sepToken}${_id}`;
    let fileName = `${moduleName}.js`;
    let filePath = path.join(root, `./src/js/boxes/${fileName}`);
    let newBox = {
      isFirstUserBox: boxes.length === 0,
      isProtected: false,
      isUserBoxes: true,
      _id,
      x: 120,
      y: 160,
      displayName,
      moduleName,
      fileName,
      slug,
      userData: [],
      inputs: [
        {
          _id: getID(),
          name: "main",
        },
        {
          _id: getID(),
          name: "speed",
        },
        {
          _id: getID(),
          name: "color",
        },
      ],
    };
    db.get("boxes").push(newBox).write();

    fs.ensureDirSync(path.join(root, `./src/js/boxes/`));
    fs.ensureFileSync(filePath);
    fs.writeFileSync(
      filePath,
      /* jsx */ `/* ${JSON.stringify(displayName)} */
export const box = () => {
}
    `,
      "utf-8"
    );

    window.dispatchEvent(new Event("try-save-state"));
    window.dispatchEvent(new Event("stream-state-to-webview"));
    window.dispatchEvent(new Event("reload-page"));

    return {
      box: newBox,
    };
  };

  const removeBox = async ({ box }) => {
    let _id = box._id;
    db.get("boxes").remove({ _id }).write();
    db.get("cables").remove({ outputBoxID: _id }).write();
    db.get("cables").remove({ inputBoxID: _id }).write();

    fs.removeSync(resolvePath({ box: box }));

    window.dispatchEvent(new Event("try-save-state"));
    window.dispatchEvent(new Event("stream-state-to-webview"));
    window.dispatchEvent(new Event("reload-page"));
  };

  let addCable = ({ outputBoxID, inputBoxID, inputSlotID }) => {
    let _id = getID();

    db.get("cables")
      .push({
        _id,
        outputBoxID,
        inputBoxID,
        inputSlotID,
      })
      .write();

    saveInstant(db.getState());
    // window.dispatchEvent(new Event("stream-state-to-webview"));
    window.dispatchEvent(new Event("reload-page"));
  };

  let removeCable = ({ cableID }) => {
    let _id = cableID;

    db.get("cables").remove({ _id }).write();

    saveInstant(db.getState());
    // window.dispatchEvent(new Event("stream-state-to-webview"));
    window.dispatchEvent(new Event("reload-page"));
  };

  let disconnectCableByBoxInput = ({ inputID }) => {
    db.get("cables").remove({ inputSlotID: inputID }).write();

    saveInstant(db.getState());
    // window.dispatchEvent(new Event("stream-state-to-webview"));
    window.dispatchEvent(new Event("reload-page"));
  };

  let removeInputByInputID = async ({ inputID, boxID }) => {
    db.get("boxes")
      .find({ _id: boxID })
      .get("inputs")
      .remove({ _id: inputID })
      .write();
    saveInstant(db.getState());
    // window.dispatchEvent(new Event("stream-state-to-webview"));
    window.dispatchEvent(new Event("reload-page"));
  };

  const resolvePath = ({ box }) => {
    // fileName
    let path = window.require("path");
    // let state = db.getState();
    let JS_FOLDER = "./src/effectnode/js";
    let BOXES_FOLDER = "./src/effectnode/js/boxes";

    if (box.isEntry) {
      return path.join(root, JS_FOLDER, box.fileName);
    } else if (box.isUserBoxes) {
      return path.join(root, BOXES_FOLDER, box.fileName);
    } else {
      return path.join(root, BOXES_FOLDER, box.fileName);
    }
  };

  return {
    removeInputByInputID,
    disconnectCableByBoxInput,
    removeCable,
    addCable,

    resolvePath,
    updateBox,
    removeBox,
    renameBox,
    addBox,
  };
};
