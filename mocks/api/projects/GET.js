var reqCount = 0;

console.log('closure?');

module.exports = function (req, res) {
  reqCount++;

  console.log('GET /api/projects', reqCount);
  setTimeout(function () {
    res.json({
      response: reqCount === 1 ? [] : [{
        id: "string",
        name: "Default"
      }]
    })
  }, 1000);
}
