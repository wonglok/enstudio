import { runSocket } from "../server/socket.js";
import { useEffect, useMemo } from "react";
import slugify from "slugify";
import { useRouteMatch } from "react-router-dom";
import { getLowDB } from "../server/boxdb";
// import { useProjectStore } from "../server/recent.js";

export function slugger(str) {
  return slugify(str, {
    replacement: "_", // replace spaces with replacement character, defaults to `-`
    lower: true, // convert to lower case, defaults to `false`
    strict: true, // strip special characters except replacement, defaults to `false`
  });
}

export function Editor() {
  let {
    params: { projectRoot },
  } = useRouteMatch();
  projectRoot = decodeURIComponent(projectRoot);

  let { slug, boxdb } = useMemo(() => {
    if (!projectRoot) {
      return {};
    }
    const slug = slugger(projectRoot);
    const boxdb = getLowDB({ projectRoot: projectRoot });

    return { slug, boxdb };
  }, [projectRoot]);

  useEffect(() => {
    if (!projectRoot) {
      console.log("cant find project");
      return () => {};
    }

    return runSocket({
      rootFolder: projectRoot,
      slug,
      boxdb,
      onReady: () => {},
    });
  }, [projectRoot]);

  return <div>123</div>;
}
