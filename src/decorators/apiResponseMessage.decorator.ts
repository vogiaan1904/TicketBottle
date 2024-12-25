import { SetMetadata } from '@nestjs/common';

export const ResponseMessage = (message?: string) =>
  SetMetadata('response_message', message);

export const NO_APPLY_RES_INTERCEPTOR = 'no_res_interceptor';
export const NoApplyResInterceptor = () =>
  SetMetadata(NO_APPLY_RES_INTERCEPTOR, true);
