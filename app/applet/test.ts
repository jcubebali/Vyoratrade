import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

try {
  initializeApp({ projectId: "gen-lang-client-0494196061" });
  const db = getFirestore("ai-studio-f30b7d66-2d7a-4f2e-915d-365a7a406c03");
  console.log("initialized!");
  db.collection("test").get().then(() => console.log("Success")).catch(e => console.log("Fetch error:", e.message));
} catch(e) {
  console.error("Init Error:", e);
}
