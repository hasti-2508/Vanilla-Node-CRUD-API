const requestBodyParser = require("../util/body-parser");
const writeToFile = require("../util/write-to-file");

module.exports = async (req, res) => {
  try {
    let baseUrl = req.url.substring(0, req.url.lastIndexOf("/") + 1);
    let id = req.url.split("/")[3];
    const regexV4 = new RegExp(
      /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
    );

    if (!regexV4.test(id)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          title: "Validation Failed",
          message: "UUID is not valid",
        })
      );
    } else if (baseUrl === "/api/movies/" && regexV4.test(id)) {
      let body = await requestBodyParser(req);
      const index = req.movies.findIndex((movie) => movie.id === id);

      if (index === -1) {
        res.statusCode = 404;
        res.write(
          JSON.stringify({ title: "Not Found", message: "Movie not found" })
        );
        res.end();
      } else {
        req.movies[index] = { id, ...body };
        writeToFile(req.movies);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(req.movies[index]));
      }
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({ title: "Not Found", message: "Route not found" })
      );
    }
  } catch (err) {
    console.error("Error:", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        title: "Internal Server Error",
        message: "An unexpected error occurred",
      })
    );
  }
};
