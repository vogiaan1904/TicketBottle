import { applyDecorators, HttpCode, Post } from '@nestjs/common';
import { ResponseMessage } from './apiResponseMessage.decorator';

interface ApiPostOptions {
  responseMessage?: string;
  path: string;
  code?: number;
}

export function ApiPost(opt: ApiPostOptions) {
  return applyDecorators(
    HttpCode(opt?.code ?? 200),
    Post(opt.path),
    ResponseMessage(opt?.responseMessage ?? 'success'),
  );
}
