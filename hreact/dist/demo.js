function test() {
  return h("h1", [h("div", {
    "class": "123",
    on: {
      "click": function click() {
        return console.log(1);
      }
    }
  })]);
}

export default test;
