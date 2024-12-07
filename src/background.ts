import { InferenceSession, Tensor } from 'onnxruntime-web';
import * as ort from 'onnxruntime-web';
import { evaluate } from 'mathjs';

ort.env.wasm.wasmPaths = {
  'ort-wasm.wasm': chrome.runtime.getURL('onnxruntime/ort-wasm.wasm'),
  'ort-wasm-threaded.wasm': chrome.runtime.getURL(
    'onnxruntime/ort-wasm-threaded.wasm'
  ),
  'ort-wasm-simd.wasm': chrome.runtime.getURL('onnxruntime/ort-wasm-simd.wasm'),
  'ort-wasm-simd-threaded.wasm': chrome.runtime.getURL(
    'onnxruntime/ort-wasm-simd-threaded.wasm'
  )
};

function getInputs() {
  const inputs = {
    usernameInput: document.querySelector(
      'input[name="loginname"]'
    ) as HTMLInputElement,
    passwordInput: document.querySelector(
      'input[name="password"]'
    ) as HTMLInputElement,
    yzm: document.querySelector('input[name="captcha_1"]') as HTMLInputElement,
    yzmImg: document.querySelector('img[alt="captcha"]') as HTMLImageElement
  };
  return inputs;
}

interface CharsetConfig {
  image: number[];
  charset: string[];
}

class ImageClassifier {
  private session: InferenceSession;

  private charset: CharsetConfig;

  constructor(session: InferenceSession, charset: CharsetConfig) {
    this.session = session;
    this.charset = charset;
  }

  async classify(imageElement: HTMLImageElement): Promise<string> {
    const { image: resize, charset } = this.charset;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2d context');

    const height = resize[1];

    const targetWidth = Math.floor(
      (imageElement.width * height) / imageElement.height
    );
    const targetHeight = height;

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(imageElement, 0, 0, targetWidth, targetHeight);

    // 获取图像数据
    const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight).data;

    // 转换为所需的通道格式
    const tensor = new Float32Array(1 * 1 * targetHeight * targetWidth);

    // 标准化图像数据
    for (let i = 0; i < targetHeight; i += 1) {
      for (let j = 0; j < targetWidth; j += 1) {
        const pixelIndex = (i * targetWidth + j) * 4;

        const grey =
          (imageData[pixelIndex] +
            imageData[pixelIndex + 1] +
            imageData[pixelIndex + 2]) /
          3;
        tensor[i * targetWidth + j] = (grey / 255 - 0.456) / 0.224;
      }
    }

    // 创建 ONNX Tensor
    const inputTensor = new Tensor('float32', tensor, [
      1,
      1,
      targetHeight,
      targetWidth
    ]);

    // 运行推理
    const outputTensor = await this.session.run({ input1: inputTensor });
    const result = outputTensor.output.data as Int32Array;

    // 处理结果
    let lastItem = 0;
    return Array.from(result)
      .filter((v) => {
        if (v !== 0 && v !== lastItem) {
          lastItem = v;
          return true;
        }
        return false;
      })
      .map((v) => charset[v])
      .join('');
  }
}

let session: InferenceSession;

// 添加一个自动填充表单的函数
async function autoFillForm() {
  console.log('autoFillForm');

  if (/https:\/\/cas\.bjtu\.edu\.cn\/auth\/login/.test(window.location.href)) {
    const { loginConfig } = await chrome.storage.sync.get(['loginConfig']);
    console.log('loginConfig', loginConfig);
    const inputs = getInputs();
    if (session === undefined) {
      session = await InferenceSession.create(
        chrome.runtime.getURL('omis.onnx')
      );
    }
    const charsetConfig: CharsetConfig = {
      image: [-1, 64], // 高度固定为64，宽度按比例计算
      // prettier-ignore
      charset: [" ", "9", "5", "-", "7", "0", "2", "6", "1", "3", "x", "8", "=", "4", "+"]
    };
    const classifier = new ImageClassifier(session, charsetConfig);
    const img = document.querySelector(
      'img[alt="captcha"]'
    ) as HTMLImageElement;
    const expression = await classifier.classify(img);
    const calcExpression = expression
      .split('=')[0]
      .replace('x', '*')
      .replace(' ', '')
      .trim();
    console.log('识别结果:', calcExpression);
    let answer: number;
    try {
      answer = evaluate(calcExpression);
    } catch (e) {
      console.error('计算验证码失败:', e);
      return;
    }
    console.log('计算结果:', answer);
    if (inputs.usernameInput && inputs.passwordInput) {
      if (loginConfig) {
        inputs.usernameInput.value = loginConfig.username;
        inputs.passwordInput.value = loginConfig.password;
      }
      inputs.yzm.value = String(answer);
    }
  }
}
// 监听页面加载完成事件
console.log('background.ts loaded');

let isFormFilled = false; // 添加标志位
let isFormFilling = false; // 添加标志位

// 为了处理可能的动态加载情况，添加 MutationObserver
const observer = new MutationObserver(async () => {
  if (!isFormFilled && !isFormFilling) {
    // 只在未填充时执行
    isFormFilling = true;
    const inputs = getInputs();
    if (
      inputs.usernameInput &&
      inputs.passwordInput &&
      inputs.yzm &&
      inputs.yzmImg
    ) {
      await autoFillForm();
      isFormFilled = true; // 设置标志位
      observer.disconnect(); // 填充完成后断开观察器
    }
    isFormFilled = true; // 设置标志位
    isFormFilling = false;
  }
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});
