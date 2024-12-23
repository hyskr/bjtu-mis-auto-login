const manifest = {
  manifest_version: 3,
  name: 'bjtu-mis-helper',
  description: '北交大MIS辅助插件||自动填充登录信息和验证码||自动完成评教任务',
  version: '1.0',
  icons: {
    '48': 'icons/icon48.png',
    '128': 'icons/icon128.png'
  },
  action: {
    default_title: '北交大MIS辅助插件',
    default_popup: './popup/index.html'
  },
  content_scripts: [
    {
      matches: ['https://cas.bjtu.edu.cn/auth/login/*'],
      js: ['mis_login.ts']
    },
    {
      matches: ['https://aa.bjtu.edu.cn/teaching_assessment/stu/*'],
      js: ['teaching_assessment.ts']
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
