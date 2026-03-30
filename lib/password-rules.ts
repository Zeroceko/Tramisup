export const MIN_PASSWORD_LENGTH = 8;

export function hasMinimumLength(password: string) {
  return password.length >= MIN_PASSWORD_LENGTH;
}

export function hasNumber(password: string) {
  return /\d/.test(password);
}

export function hasSpecialCharacter(password: string) {
  return /[^A-Za-z0-9]/.test(password);
}

export function isStrongPassword(password: string) {
  return (
    hasMinimumLength(password) &&
    hasNumber(password) &&
    hasSpecialCharacter(password)
  );
}

export function getPasswordRuleState(password: string) {
  return {
    minLength: hasMinimumLength(password),
    number: hasNumber(password),
    special: hasSpecialCharacter(password),
  };
}
