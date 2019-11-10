(() => {
  const IS_NODE_JS = typeof module == 'object' && module.exports;

  function status(text) {
    if (IS_NODE_JS) {
      console.info('status:', text);
    } else {
      document.body.textContent = text;
    }
  }

  function assert(cond, text) {
    if (!cond) throw new Error(text);
  }

  async function runTests() {
    try {
      console.log('wasm.init()');
      await wasm.init();
      console.log('running tests');
      testCreateKeyPair();
      testKeyExchange();
      testSignVerify();
      status('PASSED');
    } catch (err) {
      console.error(err);
      status(err.message);
    }
  }

  function testCreateKeyPair() {
    console.log('createKeypair()');
    let seed = wasm.createSeed();
    let [pubkey, seckey] = wasm.createKeypair(seed);
    console.debug('seed:', seed);
    console.debug('pubkey:', pubkey);
    console.debug('seckey:', seckey);
    assert(Math.max(...seed) > 0, 'seed = 0');
    assert(Math.max(...pubkey) > 0, 'pubkey = 0');
    assert(Math.max(...seckey) > 0, 'seckey = 0');
    assert(pubkey.length == 32, 'pubkey.length != 32');
    assert(seckey.length == 64, 'seckey.length != 64');
  }

  function testKeyExchange() {
    console.log('keyExchange()');
    let seed1 = wasm.createSeed();
    let seed2 = wasm.createSeed();
    let [p1, s1] = wasm.createKeypair(seed1);
    let [p2, s2] = wasm.createKeypair(seed2);
    let shared1 = wasm.keyExchange(p2, s1);
    let shared2 = wasm.keyExchange(p1, s2);
    console.debug('shared1', shared1);
    console.debug('shared2', shared2);
    assert(shared1.length == 32, 'shared1.length != 32');
    assert(shared2.length == 32, 'shared2.length != 32');
    assert(Math.max(...shared1) > 0, 'shared1 = 0');
    assert(Math.max(...shared2) > 0, 'shared2 = 0');
    assert(shared1.join(':') == shared2.join(':'), 'shared1 != shared2');
  }

  function testSignVerify() {
    console.log('sign() + verify()');
    let message = new Uint8Array(64);
    for (let i = 0; i < message.length; i++)
      message[i] = i + 1;
    let seed = wasm.createSeed();
    let [pubkey, seckey] = wasm.createKeypair(seed);
    let signature = wasm.sign(message, pubkey, seckey);
    let verified = wasm.verify(signature, message, pubkey);
    console.debug('message:', message);
    console.debug('seed:', seed);
    console.debug('pubkey:', pubkey);
    console.debug('seckey:', seckey);
    console.debug('signature:', signature);
    console.debug('verified:', verified);
    assert(signature.length == 64, 'signature.length != 64');
    assert(Math.max(...signature) > 0, 'signature = 0');
    assert(verified, 'verified = 0');
  }

  if (IS_NODE_JS) {
    wasm = require('./index');
    runTests();
  } else {
    console.log('Waiting for window.onload');
    wasm = ed25519;
    window.onload = () => runTests();
  }
})();
