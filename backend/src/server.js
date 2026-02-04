import express from "express";
import calculate from "./routes/calc.routes.js";
import patterns from "./routes/patterns.routes.js";
import resize from "./routes/resize.routes.js";

const app = express();
app.use(express.json());
app.use("/calculate", calculate);
app.use("/patterns", patterns);
app.use("/resize", resize);

app.listen(3001, () => {
  console.log("Server running on port 3001");
});
