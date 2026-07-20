/**
 * Recursive descent parser translating ExpressionEvaluator.kt
 */
export function evaluateExpression(expression: string): number {
  const sanitized = expression.replace(/\s+/g, "");
  if (sanitized.length === 0) {
    throw new Error("Empty expression");
  }
  const parser = new Parser(sanitized);
  const result = parser.parseExpression();
  if (parser.index < sanitized.length) {
    throw new Error(`Unexpected character at position ${parser.index}`);
  }
  return result;
}

class Parser {
  index = 0;
  constructor(private input: string) {}

  parseExpression(): number {
    let value = this.parseTerm();
    while (this.index < this.input.length) {
      const char = this.input[this.index];
      if (char === "+" || char === "-") {
        this.index++;
        const right = this.parseTerm();
        if (char === "+") {
          value += right;
        } else {
          value -= right;
        }
      } else {
        break;
      }
    }
    return value;
  }

  parseTerm(): number {
    let value = this.parseFactor();
    while (this.index < this.input.length) {
      const char = this.input[this.index];
      if (char === "*" || char === "/") {
        this.index++;
        const right = this.parseFactor();
        if (char === "*") {
          value *= right;
        } else {
          if (right === 0) {
            throw new Error("Division by zero");
          }
          value /= right;
        }
      } else {
        break;
      }
    }
    return value;
  }

  parseFactor(): number {
    if (this.index >= this.input.length) {
      throw new Error("Unexpected end of expression");
    }
    const char = this.input[this.index];
    if (char === "+") {
      this.index++;
      return this.parseFactor();
    }
    if (char === "-") {
      this.index++;
      return -this.parseFactor();
    }
    if (char === "(") {
      this.index++;
      const value = this.parseExpression();
      if (this.index >= this.input.length || this.input[this.index] !== ")") {
        throw new Error("Missing closing parenthesis");
      }
      this.index++; // consume ')'
      return value;
    }

    // Parse a number
    const start = this.index;
    while (this.index < this.input.length) {
      const c = this.input[this.index];
      if (/[0-9.]/.test(c)) {
        this.index++;
      } else {
        break;
      }
    }
    if (start === this.index) {
      throw new Error("Expected number or parenthesis");
    }
    const numberStr = this.input.substring(start, this.index);
    const num = parseFloat(numberStr);
    if (isNaN(num)) {
      throw new Error("Invalid number format");
    }
    return num;
  }
}
