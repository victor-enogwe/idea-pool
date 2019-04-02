export const errorStub = {
  message: 'hello error',
  code: 'error code',
  stack: 'stack trace',
  response: {
    request: {
      headers: {
        'user-agent': 'Intel x86'
      },
      agent: {
        protocol: 'https'
      },
      res: {
        headers: {
          date: Date.now()
        },
        client: {
          servername: 'wirebot'
        }
      }
    }
  }
}

export const serverError = (syscall: any, code: number) => ({ syscall, code })
