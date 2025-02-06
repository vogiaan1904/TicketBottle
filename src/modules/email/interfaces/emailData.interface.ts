export interface EmailDataInterface {
  to: string;
  from?: string;
  subject: string;
  text?: string;
  html: string;
  attachments?: any[];
}
