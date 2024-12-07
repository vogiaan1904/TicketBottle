import * as crypto from 'node:crypto';
import * as path from 'node:path';
import * as fs from 'fs';

function checkExistFolder(name: string) {
  const check_path = path.join(__dirname, `../../${name}`);
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  !fs.existsSync(check_path) && fs.mkdir(check_path, (err) => err);
}

function generateTokenKeyPair(tokenName: string) {
  checkExistFolder('keys');
  const tokenPrivateKeyPath = path.join(
    __dirname,
    `../../keys/${tokenName}.private.key`,
  );
  const tokenPublicKeyPath = path.join(
    __dirname,
    `../../keys/${tokenName}.public.key`,
  );
  const tokenPrivateKeyExists = fs.existsSync(tokenPrivateKeyPath);
  const tokenPublicKeyExists = fs.existsSync(tokenPublicKeyPath);

  if (!tokenPrivateKeyExists || !tokenPublicKeyExists) {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    fs.writeFileSync(tokenPrivateKeyPath, privateKey);
    fs.writeFileSync(tokenPublicKeyPath, publicKey);
  }

  const tokenPrivateKey = fs.readFileSync(tokenPrivateKeyPath, 'utf-8');
  const tokenPublicKey = fs.readFileSync(tokenPublicKeyPath, 'utf-8');

  return {
    privateKey: tokenPrivateKey,
    publicKey: tokenPublicKey,
  };
}

export const commonKeyPair = generateTokenKeyPair('common');
export const accessTokenKeyPair = generateTokenKeyPair('accessToken');
export const refreshTokenKeyPair = generateTokenKeyPair('refreshToken');
