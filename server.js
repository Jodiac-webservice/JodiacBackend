const express = require('express');
const cors = require('cors');
const cookieSession = require('cookie-session');
const axios = require('axios');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: "Razil-session",
    keys: ["COOKIE_SECRET"],
    httpOnly: true,
  })
);

const db = require("./models/Index.model");

db.mongoose
  .connect(`mongodb+srv://jodiacwebservice:leFen5P4LDWiCDto@cluster0.fv8e3jd.mongodb.net/`,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch((err) => {
    console.error("Cannot connect to the database!", err);
    process.exit();
  });

  app.get("/", (req, res) => {
    res.json({ message: "Welcome to Jodiac web service." });
  });

  require("./Routes/Auth.Routes")(app);
  require("./Routes/Uploadproduct.Route")(app);
  require("./Routes/Cart.Routes")(app);
  require("./Routes/Shiping.Routes")(app);
  require("./Routes/Orders.Routes")(app);

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });