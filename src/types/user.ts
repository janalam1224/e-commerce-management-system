export interface User {
  firstName?: string;
  lastName?: string;
  email: string;
  telephone?: string;
  gender?: "male" | "female" | "other";
  role: "admin" | "manager" | "staff";
  password: string;
  status?: string;
}
