const express = require("express");
const app = express();
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
require("dotenv").config();
var cors = require("cors");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middleware/error");

// database connection
mongoose
  .connect(process.env.DATABASE)
  .then(() => {
    console.log("DB Connected");
  })
  .catch((err) => {
    console.log(err);
  });

////////improting routes
const authRoutes = require("./routes/authRoutes");
const accountantRoutes = require("./routes/accountantRoutes");
const chiefauthRoutes = require("./routes/chiefauthRoutes");
const hostelallotmentRoutes = require("./routes/hostelallotmentRoutes");
const menuRoutes = require("./routes/menuRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const commentRoutes = require("./routes/commentRoutes");
////////middleware declarations
app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "5mb" })); // parse form data
app.use(
  bodyParser.urlencoded({
    limit: "5mb",
    extended: "true",
  })
);
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use("/api", authRoutes);
app.use("/api", accountantRoutes);
app.use("/api", chiefauthRoutes);
app.use("/api", hostelallotmentRoutes);
app.use("/api", menuRoutes);
app.use("/api", complaintRoutes);
app.use("/api", commentRoutes);

// error middleware
app.use(errorHandler);
// PORT
const port = process.env.PORT || 9000;

app.get("/", (req, res, next) => {
  res.status(201).send({
    message: "Success",
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
