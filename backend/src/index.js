import express from "express";
import authRoutes from "./routes/auth.route.js";
import { connectDB } from "./lib/db.js";

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log("Server is running on Port: " + PORT);
  connectDB();
});
