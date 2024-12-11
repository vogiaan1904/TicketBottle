export class TokenPayload {
  userID: string;
}

export class ResetPasswordTokenPayload {
  email: string;
}

export class VerifyAccountTokenPayload {
  email: string;
}

export class StaffTokenPayload {
  staffId: string;
}
