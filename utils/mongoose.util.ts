interface StringSchemaArgs {
  minlength?: number
  maxlength?: number
  required?: boolean
  unique?: boolean
}

interface StringSchema {
  type: any
  minlength: any[]
  maxlength: any[]
  match: any[]
  required: boolean,
  unique: boolean
}

/**
 *  String Schema Mongoose
 *
 * @export
 * @param {StringSchemaArgs} { minlength, maxlength, required } the string schema args
 * @returns {StringSchema}
 */
export function stringSchema ({ minlength, maxlength, required = false, unique = false }: StringSchemaArgs): StringSchema {
  return {
    type: String,
    minlength: [minlength || 2, `at least ${minlength || 2} characters`],
    maxlength: [maxlength || 50, `at most ${maxlength || 50} characters`],
    match: [/^[a-zA-Z0-9-\$]+$/, 'can only have numbers, letters and $'],
    required,
    unique
  }
}

/**
 * Validate Email  Address
 *
 * @export
 * @param {string} email the email address
 * @returns {boolean} is a valid email
 */
export function validateEmail (email: string): boolean {
  const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/
  return emailRegex.test(email)
}
