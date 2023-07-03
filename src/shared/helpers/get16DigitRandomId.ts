import crypto from 'crypto';

const get16DigitRandomId = () => {
  let randomNumber;
  do {
    randomNumber = parseInt(crypto.randomBytes(8).toString('hex'), 16);
  } while (randomNumber > Number.MAX_SAFE_INTEGER);

  return randomNumber;
};

export default get16DigitRandomId;
