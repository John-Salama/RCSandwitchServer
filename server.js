const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: `${__dirname}/config.env` });

//listen to uncaught exceptions
//uncaught exceptions are exceptions that are not handled by express
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

mongoose
  .connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 60000,
    socketTimeoutMS: 60000,
  })
  .then((con) => {
    console.log("DB connection successfully established!");
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
  });

const app = require("./app");

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

//listen to unhandled promise rejection
//this will not catch error in synchronous code
//this will catch error in asynchronous code
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
