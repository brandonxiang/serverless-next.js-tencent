const { Component } = require("./example/node_modules/@serverless/core");

class NextjsComponent extends Component {
  async default(inputs = {}) {
    await this.build(inputs);

    return this.deploy(inputs);
  }
  
  build() {

  }

  deploy() {
    
  }
}