import { Types } from 'mongoose'

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
          servername: 'api'
        }
      }
    }
  }
}

export const testEmail = 'email-1@test.com'
export const testPassword = 'the-Secret-123'
export const hash = '$2b$10$beGSQDSQjy0mvJPw7pnMM.ypheW94F1F48wn.wXX4Zd9jJc1MswUe'
export const refreshTokenExpiresIn = '10m'
export const refresh_secret = 'refresh_secre'
export const secret = 'secret'
export const userId = Types.ObjectId('5ca4f53deb1a133c8628c24e')

export const testUser4 = {
  email: 'email-4@test.com',
  name: 'name-4',
  avatar_url: 'https://www.gravatar.com/avatar/b36aafe03e05a85031fd8c411b69f792?d=mm&s=200'
}

export const serverError = (syscall: any, code: number) => ({ syscall, code })

// tslint:disable-next-line:max-line-length
export const passwordError = '[{"location":"body","param":"password","value":"testPassword","msg":"password must have a mimimum of eight characters, at least one letter, one number and one special character"}]'
export const emailError = '[{"location":"body","param":"email","value":"testEmail","msg":"please supply a valid email address"}]'
// tslint:disable-next-line:max-line-length
export const nameError = '[{"location":"body","param":"name","value":"test  User","msg":"Full name should be 2 to 50  characters long,  single spaced."}]'

export const jwtError = '[{"location":"body","param":"refresh_token","msg":"please supply a valid json web token"}]'

export const idea = {
  content: 'the-content',
  impact: 8,
  ease: 8,
  confidence: 8
}

// tslint:disable-next-line:max-line-length
export const ideaFieldsError = '[{"location":"body","param":"content","msg":"Invalid value"},{"location":"body","param":"ease","msg":"Please enter a number between 1 and 10"},{"location":"body","param":"impact","msg":"Please enter a number between 1 and 10"},{"location":"body","param":"confidence","msg":"Please enter a number between 1 and 10"}]'

export const ideaMembers = ['average_score', 'confidence', 'content', 'created_at', 'ease', 'id', 'impact', 'updated_at']
