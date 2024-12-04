export interface EmailDataInterface {
  to: string;
  from?: string;
  subject: string;
  template: string;
  context: object;
}
