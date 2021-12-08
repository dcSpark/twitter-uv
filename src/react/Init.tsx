import React from "react";
import { useEffect, useState } from "react";
import { urbitVisor } from "@dcspark/uv-core";
import Welcome from "./Welcome";

function Init() {
  useEffect(() => {
    urbitVisor
      .registerName("Twitter UV")
      .then((res) =>
        console.log("Twitter extension registered with Urbit Visor")
      );
  });
  const [havePerms, setHavePerms] = useState(true);
  const styles = {};
  async function checkPerms(): Promise<void> {
    urbitVisor.on("permissions_granted", [], (perms) => setHavePerms(true));
    const res = await urbitVisor.authorizedPermissions();
    setHavePerms(res.response.length > 0);
  }
  return <div style={styles}>{!havePerms && <Welcome />}</div>;
}

export default <Init />;
