export async function runSocket({
  rootFolder,
  slug,
  boxdb,
  onReady = () => {},
}) {
  // const getPort = window.require("get-port");
  // const path = window.require("path");

  // const fs = window.require("fs-extra");
  // const ensureMetaFolderPath = path.join(projectRoot, "./prod/dist/js/");
  // const metaFileSRC = path.join(projectRoot, "./src/js/meta.json");
  // const metaFileProd = path.join(projectRoot, "./prod/dist/js/meta.json");

  // let copyMETA = async () => {
  //   try {
  //     await fs.ensureDir(ensureMetaFolderPath);
  //     await fs.copy(metaFileSRC, metaFileProd);
  //   } catch (e) {
  //     console.log(e);
  //   }
  // };

  let httpServer = false;
  try {
    let fs = window.require("fs-extra");
    let path = window.require("path");
    let config = fs.readJsonSync(
      path.join(rootFolder, "./src/effectnode/config.json")
    );
    let port = config.studio.port;
    var express = window.require("express");
    var app = express();
    httpServer = window.require("http").Server(app);

    app.get("/", (req, res) => {
      res.json({ msg: "ok" });
    });

    var io = window.require("socket.io")(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    let onStreamState = () => {
      io.to(slug).emit("stream-state", { state: boxdb.getState() });
      console.log("streaming-state");
    };
    let onReloadPage = () => {
      io.to(slug).emit("reload-page", {});
    };

    io.on("connection", (socket) => {
      console.log("a user connected", socket.id);
      socket.join(slug);

      io.to(slug).emit("stream-state", { state: boxdb.getState() });
      socket.on("request-input-stream", onStreamState);
      console.log(slug);
    });

    window.addEventListener("reload-page", onReloadPage);
    window.addEventListener("stream-state-to-webview", onStreamState);

    onReady({
      port: port,
    });

    httpServer.listen(port, () => {
      console.log("listening on *:" + port);
    });
  } catch (e) {
    console.log(e);
  }

  return () => {
    if (httpServer && httpServer.close) {
      httpServer.close();
    } else {
      console.log("cant close socket server");
    }
  };
}
