import cors from "cors";
import express from "express";

export const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  }),
);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    message: "Backend ERP funcionando",
  });
});