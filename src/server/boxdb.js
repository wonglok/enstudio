import slugify from "slugify";

export function slugger(str) {
  return slugify(str, {
    replacement: "_", // replace spaces with replacement character, defaults to `-`
    lower: true, // convert to lower case, defaults to `false`
    strict: true, // strip special characters except replacement, defaults to `false`
  });
}

let DBCache = new Map();
export const getLowDB = ({ projectRoot }) => {
  if (DBCache.has(projectRoot)) {
    return DBCache.get(projectRoot);
  } else {
    const fs = window.require("fs");
    const low = window.require("lowdb");
    const Memory = window.require("lowdb/adapters/Memory");
    const adapter = new Memory();
    adapter.write = () => {
      // setTimeout(() => {
      //   window.dispatchEvent(new CustomEvent("stream-state-to-webview"));
      // }, 10);
    };
    const db = low(adapter);

    const text = fs.readFileSync(
      projectRoot + "/src/effectnode/js/meta.json",
      "utf-8"
    );

    let json = {};

    try {
      json = JSON.parse(text);
      db.setState(json);
    } catch (e) {
      console.log(e);
    }

    DBCache.set(projectRoot, db);
    return db;
  }
};
