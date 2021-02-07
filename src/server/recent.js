import localforage from "localforage";
import create from "zustand";
// import produce, { createDraft, finishDraft } from "immer"

let getID = () => `_${(Math.random() * 100000000).toFixed(0)}`;

export const useProjectStore = create((set, get) => {
  let rootStorage = localforage.createInstance({
    name: "ProjectRoots",
    version: 1.0,
    description: "Effect Node Project Roots",
  });

  let recentProjects = [];
  let getSnaps = async () => {
    let keys = await rootStorage.keys();
    let snaps = [];
    for (let key of keys) {
      let item = await rootStorage.getItem(key);
      snaps.push(item);
    }
    return snaps;
  };

  getSnaps().then((s) => {
    set({ recentProjects: s });
  });

  return {
    recentProjects,
    getDoc: async ({ _id }) => {
      return await rootStorage.getItem(_id);
    },
    makeDoc: () => {
      return {
        _id: getID(),
        ssl: false,
        cert: false,
        path: "",
      };
    },
    removeDoc: async ({ doc }) => {
      await rootStorage.removeItem(doc._id);
      get().reload();
    },
    save: async ({ doc }) => {
      await rootStorage.setItem(doc._id, doc);
      get().reload();
    },
    reload: async () => {
      let snaps = await getSnaps();
      set((s) => ({
        ...s,
        recentProjects: snaps,
      }));
    },
  };
});
