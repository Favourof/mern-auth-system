import express, { Application, Request, Response } from "express";
import cors from "cors";
import connectDB from "./config/db";
import { config } from "./config/config";
const app: Application = express();

app.use(express.json());
app.use(cors());

connectDB();

app.get("/", (req: Request, res: Response) => {
  return res
    .status(200)
    .json({ message: "Auth api is running with typscript" });
});

app.listen(config.port, () => {
  console.log(`server is running on port:${config.port}`);
});
