
## Features
* api
  * hooks
    * before
    * after
  * request
    * params validation
  * response
    * data formater
    * unified response json format
    * output cache
* logger
* error handler


```shell
# compile
npm run compile

# run
npm run start
```



Index
  controllers: Controller

Controller
  context: HttpContext
  logger: Logger
  actions: Method
  beforeHooks: Hook
  afterHooks: Hook

Action:
  name: String
  path: String
  _handler: Function
  invoke: Function
  beforeHooks: Hook
  afterHooks: Hook

Hook:
  _handler: Function
  exec: Function

HttpContext
  req: Request
  res: Response
  status: String

Logger

