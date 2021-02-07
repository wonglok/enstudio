import { runSocket } from "../server/socket.js";
import { useEffect, createContext } from "react";
import slugify from "slugify";
import { useRouteMatch } from "react-router-dom";
import { getLowDB } from "../server/boxdb";
import { Layout } from "../ui/Layout.js";
import { useBoxes } from "../server/codebox";
import { SVGArea } from "../ui/SVGArea.js";
// import { useProjectStore } from "../server/recent.js";
export const ProjectContext = createContext({});

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

  const slug = slugger(projectRoot);
  const boxdb = getLowDB({ projectRoot: projectRoot });
  const boxesUtil = useBoxes({ db: boxdb, root: projectRoot });

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

  return (
    <Layout title={"Creative Coding Project"}>
      <div style={{ height: "calc(100% - 60px)" }} className="">
        <ProjectContext.Provider
          value={{
            projectRoot,
            slug,
            lowdb: boxdb,
            boxesUtil,
          }}
        >
          <div className={"h-full w-full relative"}>
            <SVGArea></SVGArea>
          </div>
        </ProjectContext.Provider>
      </div>
    </Layout>
  );
}
