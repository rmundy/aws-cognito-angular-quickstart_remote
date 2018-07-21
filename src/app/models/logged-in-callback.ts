export interface LoggedInCallback {
  isLoggedIn(message: string, loggedIn: boolean): void;
}
