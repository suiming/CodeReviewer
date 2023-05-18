
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'code-review-right-click',
    title: '审查代码',
    contexts: ['selection']
  });
  chrome.contextMenus.create({
    id: 'code-review-right-click-custom',
    title: '执行自定义Prompt',
    contexts: ['selection']
  });
});
const keyTitle = "k-FCavZXQ";
const getValueByKey = (key)=> {
  return chrome.storage.local.get(key);
}

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  var selectedText = info.selectionText;
  chrome.storage.local.get(["key", "prompt"], function(result) {
    const API_KEY = result.key || `s${keyTitle}JeDcX2aEzYNpVT3BlbkFJrls63WJQcb4i7kNXN4d9`; // 6.1过期
    const PROMPT = result.prompt || '';

    //  处理
    if (info.menuItemId === 'code-review-right-click') {
        const promot = '你是一名公司的代码审核专家，请帮忙检查代码，指出代码中存在的问题，按列表展示:';
        reqSugesstion(API_KEY, selectedText, promot);
    } else if (info.menuItemId === 'code-review-right-click-custom') {
        const prompt = PROMPT;
        if (prompt && prompt.length > 0) {
          reqSugesstion(API_KEY, selectedText, prompt);
        }
    }
  });
});

const reqSugesstion = (API_KEY, selectedText, prompt) => {
  const promptDesc =  prompt + ':' + selectedText;
  const API_URL = 'https://api.openai.com/v1/chat/completions';

  //  展示选中文本
  const miniPrompt = prompt.substring(0, 10);
  showPopView(`${miniPrompt}...\n分析中，请稍候...`);

  const reqObject = {
    model: "gpt-3.5-turbo",
    messages: [{"role": "user", "content": promptDesc}],
    temperature: 0.2,
  };
  fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify(reqObject)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.json();
  })
  .then(data => {
    const resultText = data.choices[0].message.content;
    console.log(resultText);
    //  更新弹窗
    const display = `回复:\n${resultText}\n`;
    showPopView(display);
  })
  .catch(error => {
    console.error(error);
    //  更新弹窗
    showPopView(error.message);
  });
}

const showPopView = (text2Show) => {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs && tabs.length > 0) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "show_popup", info: {text: text2Show}});
    }
  });
}