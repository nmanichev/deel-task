const mockResponse = () => {
    let res = {};

    res.sendStatus = jest.fn().mockReturnValue(res);
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.sendStatus = jest.fn().mockReturnValue(res);

    return res;
  };
  
  const mockRequest = () => {
    let req = {};

    req.params = jest.fn().mockReturnValue(req);
    req.query = jest.fn().mockReturnValue(req);
    req.body = jest.fn().mockReturnValue(req);
    req.profile = jest.fn().mockReturnValue(req);
    req.app = {
      get: jest.fn()
    };

    return req;
  };
  
  const mockNext = () => {
    return jest.fn();
  };
  
  module.exports = { mockResponse, mockRequest, mockNext };