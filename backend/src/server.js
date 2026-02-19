import express from "express";
import calculate from "./routes/calc.routes.js";
import patterns from "./routes/patterns.routes.js";
import resize from "./routes/resize.routes.js";
import blanket from "./routes/blanket.routes.js";
import pattern from "./routes/pattern.routes.js";
import pdfMaker from "./routes/pdfMaker.route.js";

const app = express();

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use("/calculate", calculate);
app.use("/patterns", patterns);
app.use("/resize", resize);
app.use("/blanket", blanket);
app.use("/pattern", pattern);
app.use("/pdf", pdfMaker);

app.listen(3001, () => {
  console.log("Server running on port 3001");
});
