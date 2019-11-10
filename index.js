(() => {
  const IS_AMD_MODULE = typeof define == 'function' && define['amd'];
  const IS_NODE_JS = typeof module == 'object' && module.exports;

  const NODE_WASM_JS = './dist/wasm';
  const WEB_GLOBAL_EXPORT = 'ed25519';
  const WEB_GLOBAL_IMPORT = '_ed25519';

  const SEED_LEN = 32;
  const PUB_KEY_LEN = 32;
  const SEC_KEY_LEN = 64;
  const SHR_SEC_LEN = 32;
  const MSG_LEN = 64; // sha512(message)
  const SIG_LEN = 64;

  // -s GLOBAL_BASE=1024 or use malloc()
  // to avoid memory corruption
  const MEM_BLOCK = 64;
  const SEED_PTR = 1 * MEM_BLOCK;
  const PUB_KEY_PTR = 2 * MEM_BLOCK;
  const SEC_KEY_PTR = 3 * MEM_BLOCK;
  const MSG_PTR = 4 * MEM_BLOCK;
  const SIG_PTR = 5 * MEM_BLOCK;
  const SHR_SEC_PTR = 6 * MEM_BLOCK;

  let wasm = null;
  let ready = null;

  function check(array, length, name) {
    if (!(array instanceof Uint8Array))
      throw new TypeError(name + ' is not a Uint8Array');

    if (array.length != length)
      throw new TypeError(name + '.length != ' + length);
  }

  function write(bytes, offset) {
    for (let i = 0; i < bytes.length; i++)
      wasm.HEAPU8[i + offset] = bytes[i];
  }

  function read(offset, length) {
    return wasm.HEAPU8.slice(offset, offset + length);
  }

  class Ed25519 {
    constructor(_ed25519) {
      wasm = _ed25519();

      ready = new Promise(resolve => {
        wasm.then(() => {
          ready = null;
          resolve();
        });
      });
    }

    init() {
      return Promise.resolve(ready);
    }

    createSeed() {
      let seed = new Uint8Array(SEED_LEN);
      for (let i = 0; i < SEED_LEN; i++)
        seed[i] = Math.random() * 256 | 0;
      return seed;
    }

    createKeypair(seed) {
      check(seed, SEED_LEN, 'seed');
      write(seed, SEED_PTR);

      wasm._ed25519_create_keypair(
        PUB_KEY_PTR,
        SEC_KEY_PTR,
        SEED_PTR);

      let pub = read(PUB_KEY_PTR, PUB_KEY_LEN);
      let sec = read(SEC_KEY_PTR, SEC_KEY_LEN);

      return [pub, sec];
    }

    keyExchange(pubKey, secKey) {
      check(pubKey, PUB_KEY_LEN, 'pubKey');
      check(secKey, SEC_KEY_LEN, 'secKey');

      write(pubKey, PUB_KEY_PTR);
      write(secKey, SEC_KEY_PTR);

      wasm._ed25519_key_exchange(
        SHR_SEC_PTR,
        PUB_KEY_PTR,
        SEC_KEY_PTR);

      return read(SHR_SEC_PTR, SHR_SEC_LEN);
    }

    sign(message, pubKey, secKey) {
      check(message, MSG_LEN, 'message');
      check(pubKey, PUB_KEY_LEN, 'pubKey');
      check(secKey, SEC_KEY_LEN, 'secKey');

      write(message, MSG_PTR);
      write(pubKey, PUB_KEY_PTR);
      write(secKey, SEC_KEY_PTR);

      wasm._ed25519_sign(
        SIG_PTR,
        MSG_PTR,
        MSG_LEN,
        PUB_KEY_PTR,
        SEC_KEY_PTR);

      return read(SIG_PTR, SIG_LEN);
    }

    verify(signature, message, pubKey) {
      check(signature, SIG_LEN, 'signature');
      check(message, MSG_LEN, 'message');
      check(pubKey, PUB_KEY_LEN, 'pubKey');

      write(signature, SIG_PTR);
      write(message, MSG_PTR);
      write(pubKey, PUB_KEY_PTR);

      return wasm._ed25519_verify(
        SIG_PTR,
        MSG_PTR,
        MSG_LEN,
        PUB_KEY_PTR);
    }
  }

  if (IS_AMD_MODULE) {
    define(new Ed25519());
  } else if (IS_NODE_JS) {
    let wasm = require(NODE_WASM_JS);
    module.exports = new Ed25519(wasm);
  } else {
    window[WEB_GLOBAL_EXPORT] =
      new Ed25519(window[WEB_GLOBAL_IMPORT]);
  }
})();
