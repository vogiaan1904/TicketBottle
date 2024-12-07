import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { commonKeyPair } from 'src/constraints/jwt.constraints';
import { TokenService } from './token.service';

@Module({
  imports: [
    JwtModule.register({
      privateKey: commonKeyPair.privateKey,
      publicKey: commonKeyPair.publicKey,
    }),
  ],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
