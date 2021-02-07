import { useHistory } from "react-router-dom";
import Forage from "react-localforage";
import { useState } from "react";

export function SelectFolder({ onGotFolder }) {
  let onChange = (ev) => {
    let first = ev.target.files[0];
    if (first) {
      let url = first.path;
      onGotFolder({ url });
    }
  };

  return (
    <div>
      <input type="file" nwdirectory="" onInput={onChange}></input>
    </div>
  );
}

export function RecentItems() {
  return (
    <Forage.GetItem
      itemKey="recent-folders"
      render={({ inProgress, value, error }) => {
        return (
          <div>
            {error && <div>{error.message}</div>}
            {inProgress && <progress />}
            {value && <pre>{JSON.stringify(value, null, 2)}</pre>}
          </div>
        );
      }}
    />
  );
}

export function Home() {
  let history = useHistory();

  let open = ({ url }) => {
    history.push(`/project?projectFolder=${encodeURIComponent(url)}`);
  };

  return (
    <div>
      <SelectFolder onGotFolder={open}></SelectFolder>
      <RecentItems></RecentItems>
      <div>Home</div>
    </div>
  );
}
