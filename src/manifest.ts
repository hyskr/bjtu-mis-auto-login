const manifest = {
  manifest_version: 3,
  name: 'bjtu-mis-auto-login',
  description: '自动填写北交大MIS登录信息和验证码',
  version: '1.0',
  icons: {
    '48': 'icons/icon48.png',
    '128': 'icons/icon128.png'
  },
  action: {
    default_title: '北交大MIS自动登录配置',
    default_popup: './popup/index.html'
  },
  content_scripts: [
    {
      matches: ['https://cas.bjtu.edu.cn/auth/login/*'],
      js: ['background.ts']
    }
  ],
  permissions: ['storage'],
  web_accessible_resources: [
    {
      resources: [
        'omis.onnx',
        'onnxruntime/ort-wasm-simd.wasm',
        'onnxruntime/ort-wasm.wasm',
        'onnxruntime/ort-wasm-threaded.wasm',
        'onnxruntime/ort-wasm-simd-threaded.wasm'
      ],
      matches: ['http://*/*', 'https://*/*']
    }
  ]
};

export default manifest;
