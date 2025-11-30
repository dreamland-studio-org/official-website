const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernameRegex = /^[a-zA-Z0-9_\-\.]{3,32}$/;

export function validateEmail(email: string) {
  return emailRegex.test(email);
}

export function validateUsername(username: string) {
  return usernameRegex.test(username);
}
