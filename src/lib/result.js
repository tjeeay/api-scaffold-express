
class Result {
  code;
  message;
  data;
  meta;
  errors;

  constructor(code, message) {
    this.code = code;
    this.message = message;
  }
};

function handleResult(err, data) {
  
}

export {
  handleResult,
};
export default Result;
