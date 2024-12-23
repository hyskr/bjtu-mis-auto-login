window.addEventListener('load', function () {
  interface AssessmentConfig {
    text: string;
    best: { [key: string]: string };
  }

  const fillForm = function () {
    chrome.storage.sync.get(['assessmentConfig'], function (result) {
      const config: AssessmentConfig = result.assessmentConfig || {
        text: '好',
        best: { 0: '非常符合', 1: '优秀' }
      };
      console.log('评教配置:', config.best, typeof config.best);

      var radioGroups = document.querySelectorAll('.form-control');
      radioGroups.forEach(function (group) {
        const radios = group.querySelectorAll('input[type="radio"]');
        if (radios.length > 0) {
          const labels = Array.from(radios).map(radio => {
            const label = radio.parentElement?.textContent?.trim() || '';
            return { radio, label };
          });
          let selectedRadio = null;
          const bestOptions = Object.values(config.best);
          for (const option of bestOptions) {
            const found = labels.find(({ label }) =>
              label.includes(option)
            );
            if (found) {
              selectedRadio = found.radio;
              break;
            }
          }
          if (selectedRadio) {
            (selectedRadio as HTMLInputElement).checked = true;
          }
        }
      });

      var textareas = document.querySelectorAll('textarea.form-control');
      textareas.forEach(function (textarea) {
        (textarea as HTMLTextAreaElement).value = config.text;
      });

      console.log('评教页面已自动填写完成');
    });
  };

  chrome.storage.onChanged.addListener((changes, namespace) => {
    console.log('配置已更新');
    if (namespace === 'sync' && changes.assessmentConfig) {
      console.log('评教配置已更新，重新执行填写');
      fillForm();
    }
  });

  setTimeout(fillForm, 500);
});