import express from "express";

const app = express();
const PORT = process.env.PORT || 50001;

app.listen(PORT, () => {
  console.log("Server is running on Port: " + PORT);
});
