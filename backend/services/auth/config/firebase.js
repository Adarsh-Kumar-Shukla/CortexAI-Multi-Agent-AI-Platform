import admin, { cert }  from "firebase-admin";

import serviceAccount from "../serviceAccountKey.json.json" with {type:"json"};

const app=admin.initializeApp({
  credential: cert(serviceAccount)
});

export default app
