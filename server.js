const express = require("express");
const cors = require("cors");
const fasilitasRoute = require("./routes/fasilitas");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/fasilitas", fasilitasRoute);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
