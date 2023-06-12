
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'code-review-right-click',
    title: '审查代码',
    contexts: ['selection']
  });
  chrome.contextMenus.create({
    id: 'code-review-image-explain',
    title: '概念可视化/代码可视化',
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
        const promot = '你是一名公司的代码审核专家，请帮忙检查代码，指出代码中存在的问题,按列表展示:';
        reqSugesstion(API_KEY, selectedText, promot, false);
    } else if (info.menuItemId  == 'code-review-image-explain') {
        const promot = '请用中文解释这段文字,并以Mermaid流程图方式返回（上下方向,节点中文描述,不需要样式,确保符合mermaid语法）:';
        reqSugesstion(API_KEY, selectedText, promot, true);
    } else if (info.menuItemId === 'code-review-right-click-custom') {
        const prompt = PROMPT;
        if (prompt && prompt.length > 0) {
          reqSugesstion(API_KEY, selectedText, prompt, false);
        }
    }
  });
});

const reqSugesstion = (API_KEY, selectedText, prompt, isPop = false) => {
  const promptDesc =  prompt + ':' + selectedText;
  const API_URL = 'https://api.openai.com/v1/chat/completions';

  //  展示选中文本
  const miniPrompt = prompt.substring(0, 10);
  if (isPop) {
    showLoadingPop('分析中，请稍候...');
  } else {
    showInnerView(`${miniPrompt}...\n分析中，请稍候...`, isPop);
  }

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
    const display = `结果:\n${resultText}\n`;
    if (isPop) {
      showPopResult(display);
    } else {
      showInnerView(display, isPop);
    }
    
  })
  .catch(error => {
    console.error(error);
    //  更新弹窗
    if (isPop) {
      showPopResult(display);
    } else {
      showInnerView(error.message, isPop);
    }
    
  });
}

const showInnerView = (text2Show, isPop = false) => {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs && tabs.length > 0) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "show_popup", info: {text: text2Show}});
    }
  });
}

const getMermaidCode = (text) => {
	const mermaidRegex = /```mermaid\r?\n([\s\S]*?)\r?\n```/gm;
	let match;
	let mermaidCode = '';
	while ((match = mermaidRegex.exec(text))) {
		mermaidCode = match[1];
	}
	let cleanedStr = mermaidCode && mermaidCode.replace(/[，、。.,？?]/g, '');
	cleanedStr = cleanedStr.replace(/([\(\{\[])/g, "$1\"")
                 .replace(/([\)\}\]])/g, "\"$1");
	return cleanedStr ? cleanedStr: '';
}


const showLoadingPop = (text) => {
  chrome.notifications.create("my-notification", {
    type: "basic",
    title: "分析中，请稍候...",
    message: "分析结果会稍候弹出",
    iconUrl: "./icon/icon48.png"
  });
}

const showPopResult = (text) => {
  const htmlContent = getHmtlForText(text);
  // 将 HTML 页面设置为 WebviewPanel 的内容
  chrome.windows.create({
    type: 'popup',
    url: 'data:text/html,' + encodeURIComponent(htmlContent),
    width: 900,
    height: 1000
  });
}

const getHmtlForText = (text) => {
  const mermaidCode = getMermaidCode(text);
  let description = text.replace(mermaidCode, '');
  
  // const displayStyle = description&& description.length > 0? '' : 'style="display:none';
  // 创建一个 WebviewPanel
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>文字代码可视化</title>
        <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
        <!-- 配置 Mermaid 库 -->
        <script>
          mermaid.initialize({
            startOnLoad: true,
          });
        </script>
        <style>
          /* 设置页面中心宽度为 80% 并具有沾水效果 */
          body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
            margin: 20;
            overflow: auto;
          }
          #markdown {
            width: 96%;
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
            padding-top: 40px;
            box-sizing: border-box;
            background-color: #fff;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
        </style>
      </head>
      <body>
        <div id="markdown">
            <div class="mermaid">
              ${mermaidCode}
            </div>
        </div>
      </body>
    </html>
  `;

  return htmlContent;
}