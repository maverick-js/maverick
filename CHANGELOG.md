## [0.26.9](https://github.com/maverick-js/maverick/compare/v0.26.8...v0.26.9) (2023-01-09)


### Bug Fixes

* **element:** accessors should remove `$` prefix from props ([e713b9d](https://github.com/maverick-js/maverick/commit/e713b9d441ce3ca81a30a6ddb85929fcbad3603c))



## [0.26.8](https://github.com/maverick-js/maverick/compare/v0.26.7...v0.26.8) (2023-01-09)


### Bug Fixes

* **std:** more cautious `window` checks incase loaded for ssr ([2224ae3](https://github.com/maverick-js/maverick/commit/2224ae3c0810e53fd4e8801acf11d4148ff98e4a))



## [0.26.7](https://github.com/maverick-js/maverick/compare/v0.26.6...v0.26.7) (2023-01-09)


### Bug Fixes

* **compiler:** move node imports out of main path to avoid vite ssr issues ([ff40441](https://github.com/maverick-js/maverick/commit/ff40441f995923dae157bf58ada4b66490179a64))



## [0.26.6](https://github.com/maverick-js/maverick/compare/v0.26.5...v0.26.6) (2023-01-09)


### Bug Fixes

* **analyze:** `slots.description` -> `slots.docs` ([1de65e0](https://github.com/maverick-js/maverick/commit/1de65e02e4eb0c5a7b2a704703f5061db029323c))
* **analyze:** replace `normalize-path` -> `pathe` ([bb98a9c](https://github.com/maverick-js/maverick/commit/bb98a9cb0c6b6b58cd60ca75eb8ed93134b218b6))



## [0.26.5](https://github.com/maverick-js/maverick/compare/v0.26.4...v0.26.5) (2023-01-08)


### Features

* **analyze:** new `walkComponentDocs` utility ([7c16ce6](https://github.com/maverick-js/maverick/commit/7c16ce628e1808755a74380c900bf4bf43670064))



## [0.26.4](https://github.com/maverick-js/maverick/compare/v0.26.3...v0.26.4) (2023-01-08)


### Features

* **compiler:** include `length` property on class members meta ([921ffd3](https://github.com/maverick-js/maverick/commit/921ffd300b1aa8d0be302b70300295505d311c8e))



## [0.26.3](https://github.com/maverick-js/maverick/compare/v0.26.2...v0.26.3) (2023-01-08)


### Bug Fixes

* **react:** `useReactContext` should return `undefined` instead of throwing ([9106802](https://github.com/maverick-js/maverick/commit/910680252732e5a92ae069df9a210b73ba483348))



## [0.26.2](https://github.com/maverick-js/maverick/compare/v0.26.1...v0.26.2) (2023-01-08)


### Bug Fixes

* remove redundant types exports ([c7f0f57](https://github.com/maverick-js/maverick/commit/c7f0f57457167109862da505bf171662970edae1))



## [0.26.1](https://github.com/maverick-js/maverick/compare/v0.26.0...v0.26.1) (2023-01-08)


### Bug Fixes

* include declaration files as-is in `dist` ([8477b4c](https://github.com/maverick-js/maverick/commit/8477b4ce06f2d68d9b14b5526326ce32909c8bad))



# [0.26.0](https://github.com/maverick-js/maverick/compare/v0.25.7...v0.26.0) (2023-01-06)


### Features

* **runtime:** bump `@maverick-js/signals` to `5.6.0` ([bbed8fa](https://github.com/maverick-js/maverick/commit/bbed8fa413611d0e718ff064361dc2de71799208))



## [0.25.7](https://github.com/maverick-js/maverick/compare/v0.25.6...v0.25.7) (2023-01-06)


### Bug Fixes

* **react:** include root react declaration file ([ef5e94d](https://github.com/maverick-js/maverick/commit/ef5e94dd44608b872e448634012a45cdd4eb5f78))



## [0.25.6](https://github.com/maverick-js/maverick/compare/v0.25.5...v0.25.6) (2023-01-06)


### Bug Fixes

* **analyze:** check for string literal prop names when walking props ([beb02b2](https://github.com/maverick-js/maverick/commit/beb02b226e5223a041e682183ca9b9ced6f38232))
* **analyze:** dont attempt walking `setCSSVars` anymore ([6ac75cb](https://github.com/maverick-js/maverick/commit/6ac75cb9ee4eb026b8732b2f02a3c54a15e62671))
* **analyze:** signature walker missing current interface declaration ([a4891d7](https://github.com/maverick-js/maverick/commit/a4891d79032e8ef794d95cfbf436c2a34dba36e1))



## [0.25.5](https://github.com/maverick-js/maverick/compare/v0.25.4...v0.25.5) (2023-01-06)


### Bug Fixes

* **runtime:** consume hydration marker node in lite insert ([a81aeb4](https://github.com/maverick-js/maverick/commit/a81aeb4e97ace0b64acbf0ad16a3c41d9db52067))



## [0.25.4](https://github.com/maverick-js/maverick/compare/v0.25.3...v0.25.4) (2023-01-05)


### Bug Fixes

* **runtime:** bump `@maverick-js/signals` to `5.5.1` ([f22872c](https://github.com/maverick-js/maverick/commit/f22872c7adf43c8891de220fa0a61a12efd62121))



## [0.25.3](https://github.com/maverick-js/maverick/compare/v0.25.2...v0.25.3) (2023-01-05)


### Bug Fixes

* make store props configurable ([36bdc2b](https://github.com/maverick-js/maverick/commit/36bdc2b3526ab5471cd77a571b0aa5869a1281ba))



## [0.25.2](https://github.com/maverick-js/maverick/compare/v0.25.1...v0.25.2) (2023-01-04)


### Bug Fixes

* explicitly re-export from `@maverick-js/signals` ([0be44b2](https://github.com/maverick-js/maverick/commit/0be44b28cbd451fa1a47a89571d1e03e5d98e6ba))



## [0.25.1](https://github.com/maverick-js/maverick/compare/v0.25.0...v0.25.1) (2023-01-04)


### Bug Fixes

* move `@maverick-js/signals` from dev-deps to deps ([11bfca4](https://github.com/maverick-js/maverick/commit/11bfca44b409d82e8402067b13c90699156a21d0))



# [0.25.0](https://github.com/maverick-js/maverick/compare/v0.24.1...v0.25.0) (2023-01-04)


### Bug Fixes

* **element:** remove prop reflection opt in favour of host api ([aa69ade](https://github.com/maverick-js/maverick/commit/aa69ade5132ed6f56c84866e3c5c7a2836fdf896))
* **element:** share base custom element class across all definitions ([b562672](https://github.com/maverick-js/maverick/commit/b5626720e9161836fcb5985be83b0b44ed720a63))
* move render functions to respective env bundles ([ab17bbd](https://github.com/maverick-js/maverick/commit/ab17bbdac242561c04af421b599063d9520142c0))


### Features

* bump `@maverick-js/signals` to `5.5.0` ([7c6453c](https://github.com/maverick-js/maverick/commit/7c6453c291ff610f6b60db97edf77a16aa9785fb))
* **compiler:** new `diffArrays` transform feature ([8c105d8](https://github.com/maverick-js/maverick/commit/8c105d881b78735d293e8a4726b20b57f2448959))
* **element:** new custom element registration types ([fb0a0f7](https://github.com/maverick-js/maverick/commit/fb0a0f718fd9976fc6a09839db6b651427334f25))
* **react:** new `createLiteReactElement` ([542035b](https://github.com/maverick-js/maverick/commit/542035bbd5e496955a89b05b3a9e4a1a1b90034a))



## [0.24.1](https://github.com/maverick-js/maverick/compare/v0.24.0...v0.24.1) (2023-01-03)


### Bug Fixes

* **std:** allow target to be read signal for `createEvent` ([25f545c](https://github.com/maverick-js/maverick/commit/25f545c5fd9028f5cceebed4e42e3c459fad04f5))



# [0.24.0](https://github.com/maverick-js/maverick/compare/v0.23.4...v0.24.0) (2023-01-03)


### Features

* **std:** add `createEvent` utility ([f2ed9c1](https://github.com/maverick-js/maverick/commit/f2ed9c19b41c84b4d6957ab2c23c3e1db5f9bc2e))



## [0.23.4](https://github.com/maverick-js/maverick/compare/v0.23.3...v0.23.4) (2023-01-02)


### Bug Fixes

* improve element attrs/style types ([29da1a7](https://github.com/maverick-js/maverick/commit/29da1a782ceb28e73629e9f02d413ed0d076ba91))



## [0.23.3](https://github.com/maverick-js/maverick/compare/v0.23.2...v0.23.3) (2023-01-02)


### Bug Fixes

* prefix host element prop signals with `$` ([5f0c4e8](https://github.com/maverick-js/maverick/commit/5f0c4e8e60d298a6f574dc5f94883df22c703c4f))



## [0.23.2](https://github.com/maverick-js/maverick/compare/v0.23.1...v0.23.2) (2023-01-02)


### Bug Fixes

* bump `@maverick-js/signals` to `5.4.2` ([f9c67db](https://github.com/maverick-js/maverick/commit/f9c67dbaacdbabd1ab36f7aef025eaeeeec73ae7))



## [0.23.1](https://github.com/maverick-js/maverick/compare/v0.23.0...v0.23.1) (2023-01-02)


### Bug Fixes

* bump `@maverick-js/signals` to `5.4.1` ([74ffdd1](https://github.com/maverick-js/maverick/commit/74ffdd1cf5f3ec4aa5d26178ab24f868a2e8af09))
* rename `triggerEvent` -> `trigger` ([74549ef](https://github.com/maverick-js/maverick/commit/74549ef56a8d5352ac87cf9941ea6399df214bb3))



# [0.23.0](https://github.com/maverick-js/maverick/compare/v0.22.3...v0.23.0) (2023-01-01)


### Bug Fixes

* auto-unwrap JSX $children ([3198466](https://github.com/maverick-js/maverick/commit/31984664343f349a7a752933185a5b541733c8ee))
* regression dom transformer close element tags ([1b7f4cb](https://github.com/maverick-js/maverick/commit/1b7f4cbd847329dd5d7990e4bf61b8b3c8483f09))
* remove props getters and forward props as-is ([f2f4006](https://github.com/maverick-js/maverick/commit/f2f40066ca1057a8a290d370f83d9eb26b22d4cf))


### Features

* bump `@maverick-js/signals` to `5.3.0` ([899aa88](https://github.com/maverick-js/maverick/commit/899aa8863f87606312fcf5a20b3fa2fae2e7242a))
* bump `@maverick-js/signals` to `5.4.0` ([e2c7c86](https://github.com/maverick-js/maverick/commit/e2c7c86e6b88b06b4babd54fdff27e937bb8092e))
* new `groupDOMEffects` transform option ([fd0494c](https://github.com/maverick-js/maverick/commit/fd0494ca0fc9e9aadada25119717800cdcbe7995))



## [0.22.3](https://github.com/maverick-js/maverick/compare/v0.22.2...v0.22.3) (2022-12-28)


### Bug Fixes

* **element:** refactor any element types ([dafc3a7](https://github.com/maverick-js/maverick/commit/dafc3a782106c99f722e3918124e60bbd73ec816))



## [0.22.2](https://github.com/maverick-js/maverick/compare/v0.22.1...v0.22.2) (2022-12-28)


### Bug Fixes

* refactor insert expression ([3de1835](https://github.com/maverick-js/maverick/commit/3de183534f6b21dfe47628df43f6ee1ae218b262))



## [0.22.1](https://github.com/maverick-js/maverick/compare/v0.22.0...v0.22.1) (2022-12-28)


### Bug Fixes

* bump `@maverick-js/signals` to `5.1.4` ([a0eb43a](https://github.com/maverick-js/maverick/commit/a0eb43a369a7dd693c4bf5aca643be1cfb7c3aec))



# [0.22.0](https://github.com/maverick-js/maverick/compare/v0.21.0...v0.22.0) (2022-12-27)


### Bug Fixes

* accurate fast array clearing detection ([f49d671](https://github.com/maverick-js/maverick/commit/f49d671917333d24e499070f9bf65da5bc798434))
* add production node exports ([bb5fcaf](https://github.com/maverick-js/maverick/commit/bb5fcafeaeefc2925b2ce146829a0f5aecdd159a))
* avoid creating effects in closures to reduce mem usage ([4647429](https://github.com/maverick-js/maverick/commit/464742981cba6dc8f5c32b4381d61f7a7b0b70a4))
* **compiler:** directly return single jsx expressions that are scoped ([2973921](https://github.com/maverick-js/maverick/commit/297392134e693fbe402f9b219ffa03a09243aa76))
* **compiler:** non-hydration selectors are incorrect ([a3251d5](https://github.com/maverick-js/maverick/commit/a3251d550bfdd85eadc34e720517b2394eb97a79))
* mark pure element internals for treeshaking ([a176f32](https://github.com/maverick-js/maverick/commit/a176f32f654e14b29891ed7732f54c6efa85cd6d))
* **runtime:** rework node insertion to add keyed for loop support ([857b6cf](https://github.com/maverick-js/maverick/commit/857b6cf7da4da9a5b2db53f5389902924894696b))


### Features

* faster insertion and added event delegation option ([8c972ae](https://github.com/maverick-js/maverick/commit/8c972aeecd51e5e6aed1e5a8154ccb9a75d6b8ac))



# [0.21.0](https://github.com/maverick-js/maverick/compare/v0.20.0...v0.21.0) (2022-12-18)


### Bug Fixes

* **runtime:** bundle prod version of `@maverick-js/signals` ([296c693](https://github.com/maverick-js/maverick/commit/296c6933ae97d21dad01a64d053017ba7b496f20))


### Features

* bump all deps ([08fad89](https://github.com/maverick-js/maverick/commit/08fad8946dc95787316b88cda52a1f119852e84a))



# [0.20.0](https://github.com/maverick-js/maverick/compare/v0.19.0...v0.20.0) (2022-12-17)


### Bug Fixes

* **analyze:** detect readonly modifier on cssvars ([5014e50](https://github.com/maverick-js/maverick/commit/5014e50437ad76545cce20f5ee1af2790634d426))
* **compiler:** `<HostElement>` should return element ([8c3fa88](https://github.com/maverick-js/maverick/commit/8c3fa88805b8069e86908e0596d01e61c5adfabb))
* **runtime:** clean up `HostElement`/`CustomElement` signatures ([3f1ec2e](https://github.com/maverick-js/maverick/commit/3f1ec2efad6db5276423cc8d83b1ac3a8557358b))
* **runtime:** flatten some internal function calls ([7449b40](https://github.com/maverick-js/maverick/commit/7449b4072563ee4d1101cd56870d8c75cff274e3))


### Features

* **analyze:** add `optional` to cssvar meta ([f9c36d4](https://github.com/maverick-js/maverick/commit/f9c36d43b0ba21103bc36e5c89a46d298013190d))
* **element:** add `$el` property to custom element host ([204ea23](https://github.com/maverick-js/maverick/commit/204ea23ce0f1bfddac9d03abb12bb857ec9b6447))
* **element:** add `setAttributes` method to custom element host ([12680eb](https://github.com/maverick-js/maverick/commit/12680eb3ed5621ec1db847c7ee537e6925a02bb2))
* **element:** add `setStyles` method on custom element host ([871338e](https://github.com/maverick-js/maverick/commit/871338e971ad458a279509676b7bdcb315df4ec6))
* **element:** move `cssvars` from definition to host ([515e252](https://github.com/maverick-js/maverick/commit/515e25241b852e6ee5e34fda51001498d04f87a3))



# [0.19.0](https://github.com/maverick-js/maverick/compare/v0.18.2...v0.19.0) (2022-12-16)


### Features

* **runtime:** add `reset` method to stores ([24a41ed](https://github.com/maverick-js/maverick/commit/24a41ed046211a02461bf727e8cd3be05a2b6ce1))
* **runtime:** allow getters in stores for computed props ([528c1f4](https://github.com/maverick-js/maverick/commit/528c1f4bab9432c498227cebc3ebe1edca9c3c08))



## [0.18.2](https://github.com/maverick-js/maverick/compare/v0.18.1...v0.18.2) (2022-12-15)


### Bug Fixes

* **analyzer:** walk generic heritage types ([1d1d670](https://github.com/maverick-js/maverick/commit/1d1d670f2af6fb88b44e03774afc3f5c64deb91c))



## [0.18.1](https://github.com/maverick-js/maverick/compare/v0.18.0...v0.18.1) (2022-12-15)


### Bug Fixes

* **analyzer:** resolve event detail using ts checker ([2937cdb](https://github.com/maverick-js/maverick/commit/2937cdb88cf7ce396639d7e5e6667861c7edcde1))



# [0.18.0](https://github.com/maverick-js/maverick/compare/v0.17.3...v0.18.0) (2022-12-15)


### Bug Fixes

* remove host instance `$children` support ([7c01621](https://github.com/maverick-js/maverick/commit/7c0162102b5914f02ecd0b473d04355c02fd2527))


### Features

* **analyzer:** support walking generic types ([15b2f04](https://github.com/maverick-js/maverick/commit/15b2f04365ca8b8e9ed4c34fd566207fc8a79e77))



## [0.17.3](https://github.com/maverick-js/maverick/compare/v0.17.2...v0.17.3) (2022-12-13)


### Bug Fixes

* log warning if overwriting existing trigger event ([2dbb29e](https://github.com/maverick-js/maverick/commit/2dbb29e27ba260b0be1ab6c104b9c807a204a4d0))



## [0.17.2](https://github.com/maverick-js/maverick/compare/v0.17.1...v0.17.2) (2022-12-13)


### Bug Fixes

* append trigger should not throw on initial append ([645babf](https://github.com/maverick-js/maverick/commit/645babf14723363b5080db25945cb95fd6bb9300))



## [0.17.1](https://github.com/maverick-js/maverick/compare/v0.17.0...v0.17.1) (2022-12-13)


### Bug Fixes

* attr `converter` -> `type` and export defaults ([7d064be](https://github.com/maverick-js/maverick/commit/7d064be466a1a83f84c690c063ba67705febb06d))
* forward event init to super ([031c529](https://github.com/maverick-js/maverick/commit/031c529a128dead8aa257ac1c219e8293fe9cb74))
* initialize attrs correctly ([6e369a5](https://github.com/maverick-js/maverick/commit/6e369a5e19623026308aaeb5b4fc298a88faf1f4))



# [0.17.0](https://github.com/maverick-js/maverick/compare/v0.16.4...v0.17.0) (2022-12-12)


### Bug Fixes

* bump `@maverick-js/signals` to `5.0.7` ([5308e32](https://github.com/maverick-js/maverick/commit/5308e32f705b281eeda19b9a7327b3227229716c))
* **compiler:** analyzer should not walk ignored signature identifiers ([f13cecc](https://github.com/maverick-js/maverick/commit/f13cecca485319ee4e08cf293613558c085739ff))
* no nested scoped calls during non-delegate setup ([aec1199](https://github.com/maverick-js/maverick/commit/aec11991df1289c48e530e1304f953fe7151f467))



## [0.16.4](https://github.com/maverick-js/maverick/compare/v0.16.3...v0.16.4) (2022-12-10)


### Bug Fixes

* throw error on cyclic trigger event chain ([fd0342f](https://github.com/maverick-js/maverick/commit/fd0342f1d7947088fde7678a606c86308cfa1fa6))



## [0.16.3](https://github.com/maverick-js/maverick/compare/v0.16.2...v0.16.3) (2022-12-09)


### Bug Fixes

* bump `@maverick-js/signals` to `5.0.5` ([58be96c](https://github.com/maverick-js/maverick/commit/58be96c83c6262a291f1f6202270f2ab3659f799))
* bump `@maverick-js/signals` to `5.0.6` ([e4f74fd](https://github.com/maverick-js/maverick/commit/e4f74fd86faf0ee9409e868d8e7cf0d1946d2154))



## [0.16.2](https://github.com/maverick-js/maverick/compare/v0.16.1...v0.16.2) (2022-12-09)


### Bug Fixes

* exclude maverick from vite optimized deps ([66f1515](https://github.com/maverick-js/maverick/commit/66f1515b860ff8aa4b5e5590f4e2d46bacc5c234))
* prod signals being used in dev bundle ([6e121d4](https://github.com/maverick-js/maverick/commit/6e121d40101a825de2f070ffe744b02472435a30))



## [0.16.1](https://github.com/maverick-js/maverick/compare/v0.16.0...v0.16.1) (2022-12-09)


### Bug Fixes

* bump `@maverick-js/signals` to `5.0.3` ([48eacf9](https://github.com/maverick-js/maverick/commit/48eacf92310f06560a8820f28ddadb4ebcd5b119))



# [0.16.0](https://github.com/maverick-js/maverick/compare/v0.15.0...v0.16.0) (2022-12-09)


### Bug Fixes

* dont wrap re-exported effect ([98c5b45](https://github.com/maverick-js/maverick/commit/98c5b4573a1ba473390db18712cc6b64ff872d9c))
* element instance accessors should be configurable ([357fa8f](https://github.com/maverick-js/maverick/commit/357fa8ff04aa1cc420d0e41c4bfcf27d0f21e690))
* name instance functions for debugging ([ac19a40](https://github.com/maverick-js/maverick/commit/ac19a4052997b0ef70fecffe0a82f6b6add167f0))


### Features

* bump `@maverick-js/signals` to `5.0.2` ([c3bab3d](https://github.com/maverick-js/maverick/commit/c3bab3d6f31398da47e6869606cdff19e397611d))



# [0.15.0](https://github.com/maverick-js/maverick/compare/v0.14.0...v0.15.0) (2022-12-09)


### Bug Fixes

* `CustomElementInstanceHost` -> `CustomElementHost` ([d0bca60](https://github.com/maverick-js/maverick/commit/d0bca608f44e659e1bcb46a0ee490b8bde32a846))
* add missing JSX runtime type declaration ([cb10dae](https://github.com/maverick-js/maverick/commit/cb10daec962d43798ba6d5a8d86196b122c153ce))
* **analyze:** `tagname` -> `tag` ([362f780](https://github.com/maverick-js/maverick/commit/362f7806e563935e29d82240b37ed89137eb7c4d))
* **analyze:** if no initial config set prop default to undefined ([7346577](https://github.com/maverick-js/maverick/commit/7346577db232d4fb72c9c7aca954b5111da35255))


### Features

* **analyze:** include element definition meta ([2e58880](https://github.com/maverick-js/maverick/commit/2e58880b879593d8e1a18e7691a2cf3b878025de))



# [0.14.0](https://github.com/maverick-js/maverick/compare/v0.13.1...v0.14.0) (2022-12-08)


### Bug Fixes

* remove custom el update hooks - requires redesign ([d3b4e7d](https://github.com/maverick-js/maverick/commit/d3b4e7dfbb6b2a7f60cc3b0e29acac9da1977a4d))


### Features

* bump `maverick-js/signals` to `5.0.1` ([8727c81](https://github.com/maverick-js/maverick/commit/8727c81b3d70bacc106430239dc3cc1043bad7d9))



## [0.13.1](https://github.com/maverick-js/maverick/compare/v0.13.0...v0.13.1) (2022-12-06)


### Bug Fixes

* store generic `Events` type on `HTMLCustomElement` for inference ([e302149](https://github.com/maverick-js/maverick/commit/e3021499d32948bbaf998574dfbc6c80a0df9a6c))



# [0.13.0](https://github.com/maverick-js/maverick/compare/v0.12.1...v0.13.0) (2022-12-06)


### Features

* migrate from `@maverick-js/observables` to `@maverick-js/signals` ([57f607f](https://github.com/maverick-js/maverick/commit/57f607f06a451ef24428e3b84b35ec2d1f9bee48))



## [0.12.1](https://github.com/maverick-js/maverick/compare/v0.12.0...v0.12.1) (2022-12-02)


### Bug Fixes

* refactor element types ([2c6b66d](https://github.com/maverick-js/maverick/commit/2c6b66d35e22295be901dd68f85a9a978aef9409))



# [0.12.0](https://github.com/maverick-js/maverick/compare/v0.11.0...v0.12.0) (2022-12-02)


### Bug Fixes

* lifecycle hooks no longer provide host element ([adc8d43](https://github.com/maverick-js/maverick/commit/adc8d430f85981dab5210151e843e2e8938f16fb))
* remove `useHost` ([ad2b10d](https://github.com/maverick-js/maverick/commit/ad2b10dd0a8901932626eafd106c9ee6aa0e5896))


### Features

* new `useHostConnected` ([5cf6542](https://github.com/maverick-js/maverick/commit/5cf65429b6f8ea11153c2f8d4e7ddf9f59733b03))



# [0.11.0](https://github.com/maverick-js/maverick/compare/v0.10.0...v0.11.0) (2022-12-02)


### Bug Fixes

* `defineCustomElement` -> `registerCustomElement` ([cf1078c](https://github.com/maverick-js/maverick/commit/cf1078cc8a45b71d8e36b2671f3fbf10701b96a9))
* `defineElement` -> `defineCustomElement` ([b0a658a](https://github.com/maverick-js/maverick/commit/b0a658a55a4870f5da8c22733c6b229a4ce7495c))



# [0.10.0](https://github.com/maverick-js/maverick/compare/v0.9.2...v0.10.0) (2022-12-02)


### Bug Fixes

* `MaverickElement` -> `HTMLCustomElement` ([b344ec0](https://github.com/maverick-js/maverick/commit/b344ec0682599e3be764f6599168fc1842b8d124))
* stricter std event dispatch/listen functions ([4b170b6](https://github.com/maverick-js/maverick/commit/4b170b6f28c01344a7d48a38d18e6096ada47064))



## [0.9.2](https://github.com/maverick-js/maverick/compare/v0.9.1...v0.9.2) (2022-12-02)


### Bug Fixes

* include global `MaverickEventMap` interface for std lib type mappings ([f99661f](https://github.com/maverick-js/maverick/commit/f99661f96cf66318dcc74d4fb72b114db88ec30d))



## [0.9.1](https://github.com/maverick-js/maverick/compare/v0.9.0...v0.9.1) (2022-12-01)


### Bug Fixes

* `useHost` should return element instance host ([62fcb09](https://github.com/maverick-js/maverick/commit/62fcb09d7e2a79c4af6983349aeb7752572ec2c7))
* element lifecycle hooks can accept any element ([ea2d2c7](https://github.com/maverick-js/maverick/commit/ea2d2c72d9a52ad40cc335566a0d6aa6834b8644))



# [0.9.0](https://github.com/maverick-js/maverick/compare/v0.8.0...v0.9.0) (2022-12-01)


### Bug Fixes

* align analyzer with new type system ([15b0d80](https://github.com/maverick-js/maverick/commit/15b0d80240e8729b1c3db9c04e1fe096de75d011))
* remove redundant `define` stripping ([bece828](https://github.com/maverick-js/maverick/commit/bece8285ca79518c76f676dbc2f83ce20d396444))


### Features

* revamp custom element type system ([884d747](https://github.com/maverick-js/maverick/commit/884d747571a8d905e300b4120ab1762e92d324fc))



# [0.8.0](https://github.com/maverick-js/maverick/compare/v0.7.0...v0.8.0) (2022-11-29)


### Bug Fixes

* do not observe dispatched event handlers ([f7d7d81](https://github.com/maverick-js/maverick/commit/f7d7d810b4314e682eab8856d8ea6d2423f50ea1))
* event `detail` is required by default ([9d4b7a2](https://github.com/maverick-js/maverick/commit/9d4b7a2f20c1fd5b585308da18678e6fdfb38e9f))


### Features

* revamp context api ([6151532](https://github.com/maverick-js/maverick/commit/61515325bd82c2f5bc3dd7569c680c9e13d6a96e))



# [0.7.0](https://github.com/maverick-js/maverick/compare/v0.6.1...v0.7.0) (2022-11-26)


### Features

* bump `@maverick-js/observables` to `4.9.7` ([158a0fc](https://github.com/maverick-js/maverick/commit/158a0fcf076ad55eef085086f764b48b7bb84be1))



## [0.6.1](https://github.com/maverick-js/maverick/compare/v0.6.0...v0.6.1) (2022-11-25)


### Features

* bump `@maverick-js/observables` to `4.9.6` ([f3e29ef](https://github.com/maverick-js/maverick/commit/f3e29efe3d34f341a5355598ef2c2723ba7db68d))



# [0.6.0](https://github.com/maverick-js/maverick/compare/v0.5.3...v0.6.0) (2022-11-24)


### Bug Fixes

* add `browser` package export field ([572c4dd](https://github.com/maverick-js/maverick/commit/572c4dd90fe910647c880b999202ac8ced4027e7))
* add attr converter to object literal prop defs ([6b57e27](https://github.com/maverick-js/maverick/commit/6b57e27e8915a74b7e6e9844b212feba4ff7e3dd))
* dont ssr `<shadow-root>` if no render ([369ffe3](https://github.com/maverick-js/maverick/commit/369ffe3db24e70a85563de4126ddf1872d751147))
* element `setup` function can be void ([0e4fb7f](https://github.com/maverick-js/maverick/commit/0e4fb7fa40dd422e09e9ec3f817f64d0182766f5))


### Features

* add `pick` and `omit` to std lib ([70fb9c5](https://github.com/maverick-js/maverick/commit/70fb9c51c2dc1e7370686286ad12aad61cd9415e))
* new `accessors` prop on element instance ([662e005](https://github.com/maverick-js/maverick/commit/662e005f3d44196f6d102303b09e50888bab670c))



## [0.5.3](https://github.com/maverick-js/maverick/compare/v0.5.2...v0.5.3) (2022-11-22)


### Bug Fixes

* push custom element deps in correct order ([0c8ad01](https://github.com/maverick-js/maverick/commit/0c8ad0191fb7cefc63817f0fa6a14bedf4ed790a))



## [0.5.2](https://github.com/maverick-js/maverick/compare/v0.5.1...v0.5.2) (2022-11-22)


### Bug Fixes

* auto handle in-order rendering of custom elements ([efb02de](https://github.com/maverick-js/maverick/commit/efb02deedeaae3ede13acdc1accb2612301519ee))
* forward context map to light dom children ([1e09088](https://github.com/maverick-js/maverick/commit/1e09088d7649f255c383c1f8abb3818ee79656ae))



## [0.5.1](https://github.com/maverick-js/maverick/compare/v0.5.0...v0.5.1) (2022-11-21)


### Bug Fixes

* `dispatchEvent` should return `boolean` ([c0a4da3](https://github.com/maverick-js/maverick/commit/c0a4da3b8307c91e8ec2d52a964b98130d6c8ce5))



# [0.5.0](https://github.com/maverick-js/maverick/compare/v0.4.3...v0.5.0) (2022-11-21)


### Features

* new `dispatchEvent` in std lib ([18bb9f5](https://github.com/maverick-js/maverick/commit/18bb9f50e183e524a79703881482e0e61429f6e3))



## [0.4.3](https://github.com/maverick-js/maverick/compare/v0.4.2...v0.4.3) (2022-11-21)


### Bug Fixes

* move `defineEvent` to element lib ([b0aa494](https://github.com/maverick-js/maverick/commit/b0aa4942cda3c9f949732343280fc289bed5af9a))
* rename `listen` -> `listenEvent` ([c7b9b5f](https://github.com/maverick-js/maverick/commit/c7b9b5faf57f6e5d125df000b8f4b913ef8b3ba9))


### Features

* new `createEvent` in std lib ([b5a00e7](https://github.com/maverick-js/maverick/commit/b5a00e732bc8183d24055df97d42d08fc1264091))



## [0.4.2](https://github.com/maverick-js/maverick/compare/v0.4.1...v0.4.2) (2022-11-20)


### Bug Fixes

* incorrect `DisposalBin.add` method argument ([a7fc65f](https://github.com/maverick-js/maverick/commit/a7fc65f2d5de565af336b2ec661f7f867f3ace64))
* specify `listen` function return type ([596d92e](https://github.com/maverick-js/maverick/commit/596d92e27e68bfcf927c3c72c8e8962e585fd2d7))



## [0.4.1](https://github.com/maverick-js/maverick/compare/v0.4.0...v0.4.1) (2022-11-20)


### Bug Fixes

* typo in `useHost` error ([78ddf6a](https://github.com/maverick-js/maverick/commit/78ddf6aac724d267832a1137a3d1a810e2aae71f))



# [0.4.0](https://github.com/maverick-js/maverick/compare/v0.3.0...v0.4.0) (2022-11-20)


### Bug Fixes

* `listen` returns remove listener function ([2a38333](https://github.com/maverick-js/maverick/commit/2a38333e10e0d47377b726474f75d568dde9d657))


### Features

* new `useDisposalBin` hook ([a68bb3a](https://github.com/maverick-js/maverick/commit/a68bb3a92bf8b129e2512b2eef541bc1cf4a264b))
* new `useHost` hook ([08f5f4f](https://github.com/maverick-js/maverick/commit/08f5f4fd23ffb0d85bd81783da5949280e20007b))



# [0.3.0](https://github.com/maverick-js/maverick/compare/v0.2.4...v0.3.0) (2022-11-20)


### Features

* `onAttach` can return destroy callback ([5efa79a](https://github.com/maverick-js/maverick/commit/5efa79a01d64b24ae696444b83c378a41ec8066c))



## [0.2.4](https://github.com/maverick-js/maverick/compare/v0.2.3...v0.2.4) (2022-11-20)


### Bug Fixes

* `context.get()` -> `context()` ([a95d1d1](https://github.com/maverick-js/maverick/commit/a95d1d14a181e50d60e23155d24076b7ea13646a))
* isolate lifecycle hook errors ([5201e5c](https://github.com/maverick-js/maverick/commit/5201e5c904f0c22ade1e3818470e91aba974048d))



## [0.2.3](https://github.com/maverick-js/maverick/compare/v0.2.2...v0.2.3) (2022-11-20)


### Bug Fixes

* resolve maverick dep package types ([d166454](https://github.com/maverick-js/maverick/commit/d1664541b76af3ecc2d91eee6bb2b7017454411e))



## [0.2.2](https://github.com/maverick-js/maverick/compare/v0.2.1...v0.2.2) (2022-11-20)


### Bug Fixes

* do not hydrate static expressions ([ee3499d](https://github.com/maverick-js/maverick/commit/ee3499d3ff7a16d7c8f327f440d6c8afdb91140a))
* run `onConnect` in disposable scope ([8bcc515](https://github.com/maverick-js/maverick/commit/8bcc515c46f2da3b94c0bf82cf518e295ffcde9f))



## [0.2.1](https://github.com/maverick-js/maverick/compare/v0.2.0...v0.2.1) (2022-11-19)


### Bug Fixes

* move global types out of `JSX` namespace ([8779841](https://github.com/maverick-js/maverick/commit/8779841edf5a56708f8e66fa1bf5dea7599c0d49))



# [0.2.0](https://github.com/maverick-js/maverick/compare/v0.1.1...v0.2.0) (2022-11-19)


### Features

* pass host element to lifecycle callbacks ([aab03af](https://github.com/maverick-js/maverick/commit/aab03afa0f3c9746fe116e7d95749f50b365f153))



## [0.1.1](https://github.com/maverick-js/maverick/compare/v0.1.0...v0.1.1) (2022-11-19)


### Bug Fixes

* move `DOMEvent` to `std` lib ([9cc1363](https://github.com/maverick-js/maverick/commit/9cc136357a64aadf04e8fd0363926894c8a2b83e))



# [0.1.0](https://github.com/maverick-js/maverick/compare/v0.0.6...v0.1.0) (2022-11-19)


### Features

* new standard library `maverick.js/std` ([51a3a1d](https://github.com/maverick-js/maverick/commit/51a3a1dcf59a6c6d1b7b5681029aecba26756a23))



## [0.0.6](https://github.com/maverick-js/maverick/compare/v0.0.5...v0.0.6) (2022-11-18)


### Bug Fixes

* point module entry point at runtime ([3701681](https://github.com/maverick-js/maverick/commit/370168164f898b21be3ecb2066afe51db459325f))



## [0.0.5](https://github.com/maverick-js/maverick/compare/v0.0.4...v0.0.5) (2022-11-18)


### Bug Fixes

* incorrect module entry points ([8601408](https://github.com/maverick-js/maverick/commit/8601408480b3c319e72ecf9685941e9c71c0fe2f))



## [0.0.4](https://github.com/maverick-js/maverick/compare/v0.0.3...v0.0.4) (2022-11-18)


### Features

* move compiler to `@maverick-js/compiler` ([366ed68](https://github.com/maverick-js/maverick/commit/366ed682f6f7a5a290f94a1411c8c5b3cdcd6146))



# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.0.3](https://github.com/maverick-js/maverick/compare/v0.0.2...v0.0.3) (2022-11-16)


### Features

* bump `@maverick-js/observables` to `4.8.4` ([8fea7cc](https://github.com/maverick-js/maverick/commit/8fea7cc5001bf6038c2a92d8f0535ab82115f3b5))


### Bug Fixes

* deprecated `getParent` -> `getScope` ([34e9b44](https://github.com/maverick-js/maverick/commit/34e9b44aadfa69fc56597f2ef75cb0db5d521774))
* **element:** only initialize cssvars if not set ([12fd15c](https://github.com/maverick-js/maverick/commit/12fd15c0f07a3f0fed289cb985b0073646aaff7c))
* faulty fragment hydration ([2326d9d](https://github.com/maverick-js/maverick/commit/2326d9da6ed48c831339aa795180538842ca2899))

### 0.0.2 (2022-11-14)


### Features

* `<ErrorBoundary>` ([5e39c3a](https://github.com/maverick-js/maverick/commit/5e39c3ad40912149fd42d7bb12916e63029d0ae2))
* `createContext` ([98bc536](https://github.com/maverick-js/maverick/commit/98bc536a34403cd2c028eb558b9b6e649fdceed4))
* add `$prop:innerHTML` support for both dom/ssr ([acd224a](https://github.com/maverick-js/maverick/commit/acd224a72b95b4eb8101f605f0e35acac6a5a89f))
* add bundler plugins ([e76b7ac](https://github.com/maverick-js/maverick/commit/e76b7acccd72a70bcfb9c35716a73ae4763344f3))
* add jsx runtime types ([6361797](https://github.com/maverick-js/maverick/commit/6361797bce18d7f3d9596875b9b4214e22ef652e))
* add more type inference options to `defineElement` ([ddc888b](https://github.com/maverick-js/maverick/commit/ddc888b8bf192ef158333fbd91e5671a513f80df))
* add type declarations ([a117c38](https://github.com/maverick-js/maverick/commit/a117c38b3ac0ce7684a236cdae29eaf53846fb1c))
* compiler will strip out type inference functions ([6e14077](https://github.com/maverick-js/maverick/commit/6e14077ece9713abfc200c6a742589d36713729d))
* dom runtime ([4a320a8](https://github.com/maverick-js/maverick/commit/4a320a8acda2d570fe1547037dda82661385f66c))
* dom runtime can insert array ([d9b1566](https://github.com/maverick-js/maverick/commit/d9b15669c40b2ef09e343447b61ff3138193fb84))
* element css vars builder ([5c423fd](https://github.com/maverick-js/maverick/commit/5c423fddc61cbebdd441fa69bb30c05815b4793b))
* element cssvars supports builder api ([53f121d](https://github.com/maverick-js/maverick/commit/53f121daa727c1fc8df02b012e8e98b90761e03c))
* group static style and css var expressions ([9843365](https://github.com/maverick-js/maverick/commit/9843365b82096bb72b84da0bcb41e890b87a1ada))
* hydration fixes + new `CustomElement` component ([30a89b0](https://github.com/maverick-js/maverick/commit/30a89b0a09b71c5264c75137f878272c96499691))
* initial dom compiler ([c5dc2f2](https://github.com/maverick-js/maverick/commit/c5dc2f213218dd83ca6adad73f7a0e620d891bae))
* make hydratable compilation optional ([bf0a4e2](https://github.com/maverick-js/maverick/commit/bf0a4e2b80f26559a109949795f7809a1722c717))
* merge component children into array ([56fb594](https://github.com/maverick-js/maverick/commit/56fb594e269414c286eebcfe9bb618afe0ad5546))
* merge duplicate templates ([0ab294f](https://github.com/maverick-js/maverick/commit/0ab294fb628e8287327cc864f932508e01c7d2ca))
* new `<For>` and `<ForKeyed>` components ([6085bd5](https://github.com/maverick-js/maverick/commit/6085bd5c43142da88a5abf21d11170bbb5691ef9))
* new `createHTMLElement` ([abd5d0a](https://github.com/maverick-js/maverick/commit/abd5d0a03a62dab0e0401a50c02c73ed3aef82da))
* new `createReactHook` ([c6c3d59](https://github.com/maverick-js/maverick/commit/c6c3d59b4f64d284643517c460b23bba5c227182))
* new `createSSRElement` ([7716073](https://github.com/maverick-js/maverick/commit/77160735af375dc9d76d52095516b65d98f51a4d))
* new `css` tag and define element option ([20a800a](https://github.com/maverick-js/maverick/commit/20a800a54c8846ec4245961594fd45fdb45a0bbb))
* new `parent` element define option ([638c34a](https://github.com/maverick-js/maverick/commit/638c34ac7208cddd6e0fd809e3f6c9638a069456))
* new cli analyze command ([ff1ccea](https://github.com/maverick-js/maverick/commit/ff1ccead06f78204744831e1a898c37efd772524))
* new virtual `<HostElement>` ([0137012](https://github.com/maverick-js/maverick/commit/0137012d1feefaa00fc82daf4e09728ddd05cf38))
* react integration ([0ab3b85](https://github.com/maverick-js/maverick/commit/0ab3b854108d0ec7966f16553bc748b1210e3532))
* skip hydration of static parts ([0ee229a](https://github.com/maverick-js/maverick/commit/0ee229a6467c9446e9b5f450a6c99bd547f84383))
* ssr compilation and runtime ([4044eb8](https://github.com/maverick-js/maverick/commit/4044eb89266a91752dc70f12276f1d87d46644bf))
* upgrade `@maverick-js/observables` to `4.0` ([feaaa1d](https://github.com/maverick-js/maverick/commit/feaaa1d981527c41b13b3f3d80e903d30b181307))
* use `dprint` to format transfomed code ([9d450b4](https://github.com/maverick-js/maverick/commit/9d450b4a400ed6221ec0d4f4b3124fe9814464d2))
* use fake `shadow-root` instead of comments ([cfc0d7f](https://github.com/maverick-js/maverick/commit/cfc0d7ff70f7dc29d487e63fe082045c275202ca))


### Bug Fixes

* `$on_capture` -> `$oncapture` ([24f1739](https://github.com/maverick-js/maverick/commit/24f1739f7731206736d768499cc49323914910ff))
* account for text nodes during dom insertion ([205eb2e](https://github.com/maverick-js/maverick/commit/205eb2e33a2e54930121a1728753e29718df29a9))
* add `cjs` exports ([c6f48a4](https://github.com/maverick-js/maverick/commit/c6f48a47bf7d705ccbea27145a9b85d1c1e7eae9))
* attach element instance separately ([78dee75](https://github.com/maverick-js/maverick/commit/78dee759b0b79c3466b339a49ba131227869addb))
* cache element ssr renderers ([abae9df](https://github.com/maverick-js/maverick/commit/abae9df62d312ff9077bcde13c57eb9adbc7687b))
* compile fragment children correctly ([c353a02](https://github.com/maverick-js/maverick/commit/c353a028c3a42209b20246461e258bc3326204d9))
* compile jsx expressions in jsx attrs ([b819132](https://github.com/maverick-js/maverick/commit/b819132831296b773d2d9f6d420324f6dd180b9b))
* custom element fixes ([30a8657](https://github.com/maverick-js/maverick/commit/30a86579682650eb0972b255f2f05d9e2b71b5f5))
* drop currently unused svg runtime checks ([a17cb45](https://github.com/maverick-js/maverick/commit/a17cb45eb4122efe9b5f771183d1688b6014023f))
* dynamically toggle classes during ssr ([81475b9](https://github.com/maverick-js/maverick/commit/81475b9445df28d2545777501b763ea176729dbf))
* dynamically toggle styles during ssr ([fc2b957](https://github.com/maverick-js/maverick/commit/fc2b9570afeecb158fd2aeaed63fd9cd966cb72e))
* flatten arrays during ssr ([2b0100f](https://github.com/maverick-js/maverick/commit/2b0100fcf5aa5cc4a0c23e998d126c4ebe4a43e1))
* merge components props/spreads in given order ([1a6f94c](https://github.com/maverick-js/maverick/commit/1a6f94c0749f4654f2a178db9b86377eda5d4ede))
* merge spreads/classes/styles during ssr ([91f6437](https://github.com/maverick-js/maverick/commit/91f6437fd266e4d56db2090514604fbfc36ff6e7))
* move inner content props to `$prop` ns ([cd3acd9](https://github.com/maverick-js/maverick/commit/cd3acd94f5888b0fe1f316f920f25c6c6ebc735f))
* move static class fields up inside closure ([d0929d2](https://github.com/maverick-js/maverick/commit/d0929d25b87da711d701acd0494ca8b7fac17457))
* prefer `append` over `insertBefore` for perf ([8145c3d](https://github.com/maverick-js/maverick/commit/8145c3d00e639fc10c576a9635aff0f470182748))
* remove insert effect if no observer ([0731767](https://github.com/maverick-js/maverick/commit/0731767cd6bf5351b47a160de09fa145b6d702a4))
* remove redundant fn scoping inside children getters ([529ceea](https://github.com/maverick-js/maverick/commit/529ceea50f45de0de3ac46aef54cb3fc423c9582))
* rename `MaverickEvent` to `DOMEvent` ([61ad430](https://github.com/maverick-js/maverick/commit/61ad4306fc6cb081a34ed40f402915ea40a18c7a))
* rename `shadow` -> `shadowRoot` ([a9b16b6](https://github.com/maverick-js/maverick/commit/a9b16b69dcd7d333d52487944939c8b5bd824f4c))
* rename compiled prop `element` -> `$element` ([3a46835](https://github.com/maverick-js/maverick/commit/3a46835649dcc8dab72d2e39ca79fd4b893bb493))
* rename compiled/reactive prop `children` -> `$children` ([385d0b1](https://github.com/maverick-js/maverick/commit/385d0b14412ae1f3eb93a5645ecbd077c45cb495))
* resolve attrs in server element once ([cd8a6fe](https://github.com/maverick-js/maverick/commit/cd8a6fe9fa56112a78d2eb88cb580ebcf735d372))
* resolve reflected props in server element once ([59f308f](https://github.com/maverick-js/maverick/commit/59f308f6f30ee7ea0d4411a484a68babcf97e223))
* resuming hydration should be explicit ([74893d8](https://github.com/maverick-js/maverick/commit/74893d856e681af9e12d3363aa008ef11a244ed2))
* return registered element definitions ([0a22072](https://github.com/maverick-js/maverick/commit/0a22072a9f78d96f197c2db2b48131c09f4421a3))
* scope element lifecycle callbacks ([1f00095](https://github.com/maverick-js/maverick/commit/1f00095514bb1e07266591e1d5deeefbc0c37d59))
* support binary/conditional expressions ([d01492e](https://github.com/maverick-js/maverick/commit/d01492e3a96ce5053f3f253a923ee36207bf25ae))
* support shorthand jsx attributes ([f2b522f](https://github.com/maverick-js/maverick/commit/f2b522f8c0659eeb384ccdf1a15008e9baf963ba))
* track all element dispatched events ([6061a44](https://github.com/maverick-js/maverick/commit/6061a44abe318a3b39d78986372015b82697fdec))
