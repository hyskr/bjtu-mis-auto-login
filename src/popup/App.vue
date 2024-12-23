<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';

interface LoginConfig {
  username: string;
  password: string;
}
interface AssessmentConfig {
  text: string;
  best: { [key: string]: string };
}

const presetConfigs = reactive<Record<string, LoginConfig>>({
  empty: { username: '', password: '' }
});

const config = ref<LoginConfig>({
  username: '',
  password: ''
});
const assessmentConfig = ref<AssessmentConfig>({
  text: '好',
  best: { 0: '非常符合', 1: '优秀' }
});
const bestInputRef = ref('');

const message = ref('');

onMounted(async () => {
  try {
    const result = await chrome.storage.sync.get([
      'loginConfig',
      'presetConfigs',
      'assessmentConfig'
    ]);
    if (result.loginConfig) {
      config.value = result.loginConfig;
    }
    if (result.presetConfigs) {
      Object.assign(presetConfigs, result.presetConfigs);
    }
    if (result.assessmentConfig) {
      assessmentConfig.value = result.assessmentConfig;
      bestInputRef.value = Object.values(assessmentConfig.value.best).join('，');
    }
  } catch (error) {
    console.error('Failed to load config:', error);
  }
});

// 保存配置
const handleSave = async () => {
  try {
    const configKey = `${config.value.username}`;
    if (!presetConfigs[configKey]) {
      presetConfigs[configKey] = { ...config.value }; // Add to presets
    }

    await chrome.storage.sync.set({
      loginConfig: config.value,
      presetConfigs
    });

    message.value = '配置已保存并添加到预设';
  } catch (error) {
    console.error('Failed to save config:', error);
    message.value = '保存失败';
  }
};

const handleSaveAssessment = async () => {
  try {
    const values = bestInputRef.value
      .replace(/[,，]/g, ',')
      .split(',')
      .filter((item: string) => item.trim());
    
    assessmentConfig.value.best = Object.fromEntries(values.map((v, i) => [i, v]));
    
    await chrome.storage.sync.set({
      assessmentConfig: assessmentConfig.value
    });
    message.value = '配置已保存';
  } catch (error) {
    console.error('Failed to save config:', error);
    message.value = '保存失败';
  }
};

const handleClearAssessment = async () => {
  try {
    const defaultConfig = {
      text: '好',
      best: { 0: '非常符合', 1: '优秀' }
    };
    assessmentConfig.value = defaultConfig;
    bestInputRef.value = Object.values(defaultConfig.best).join('，');
    await chrome.storage.sync.set({
      assessmentConfig: defaultConfig
    });
    message.value = '配置已重置';
  } catch (error) {
    console.error('Failed to clear config:', error);
    message.value = '重置失败';
  }
};

// 清除配置
const handleClear = async () => {
  try {
    const configKey = `${config.value.username}`;
    if (presetConfigs[configKey]) {
      delete presetConfigs[configKey];
    }

    config.value = { username: '', password: '' };
    await chrome.storage.sync.set({
      loginConfig: config.value,
      presetConfigs
    });

    message.value = '配置已清除并从预设中移除';
  } catch (error) {
    console.error('Failed to clear config:', error);
    message.value = '清除失败';
  }
};

const switchConfig = (configKey: string) => {
  if (presetConfigs[configKey]) {
    config.value = { ...presetConfigs[configKey] };
    message.value = `已切换到${configKey === 'empty' ? '空配置' : configKey}`;
  } else {
    message.value = '预设配置不存在';
  }
};
</script>

<template>
  <div class="container">
    <h2>登录配置</h2>
    <div class="quick-switch">
      <button v-for="(_, key) in presetConfigs" :key="key" @click="switchConfig(key)" class="switch-button">
        {{ key === 'empty' ? '空配置' : key }}
      </button>
    </div>

    <div class="form-group">
      <input type="text" v-model="config.username" placeholder="用户名" class="input" />
    </div>
    <div class="form-group">
      <input type="password" v-model="config.password" placeholder="密码" class="input" />
    </div>
    <div class="button-group">
      <button @click="handleSave" class="button save">保存配置</button>
      <button @click="handleClear" class="button clear">清除配置</button>
    </div>
    <h2>评教配置</h2>
    <div class="form-group">
      <label>最佳选项关键词（用逗号分隔）</label>
      <input type="text" 
        v-model="bestInputRef"
        placeholder="例如：非常符合，优秀" 
        class="input" />
    </div>
    <div class="form-group">
      <label>评教内容</label>
      <input type="text" 
        v-model="assessmentConfig.text" 
        placeholder="评教内容"
        class="input" />
    </div>
    <div class="button-group">
      <button @click="handleSaveAssessment" class="button save">保存配置</button>
      <button @click="handleClearAssessment" class="button clear">重置配置</button>
    </div>
    <div v-if="message" class="message">{{ message }}</div>
  </div>
</template>

<style scoped>
.quick-switch {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.switch-button {
  padding: 4px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #f8f9fa;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.switch-button:hover {
  background-color: #e9ecef;
  border-color: #ced4da;
}

.container {
  padding: 20px;
  min-width: 300px;
}

.form-group {
  margin-bottom: 15px;
}

.input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  flex: 1;
}

.save {
  background-color: #4caf50;
  color: white;
}

.clear {
  background-color: #f44336;
  color: white;
}

.message {
  margin-top: 15px;
  padding: 10px;
  border-radius: 4px;
  background-color: #f8f9fa;
  text-align: center;
  font-size: 14px;
}

h2 {
  margin-bottom: 20px;
  text-align: center;
  color: #333;
}
</style>
