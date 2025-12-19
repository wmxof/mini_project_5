import { Suspense } from "react";
import EditClient from "./EditClient";

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading...</div>}>
      <EditClient />
    </Suspense>
  );
}
