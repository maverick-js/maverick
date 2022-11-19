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
