function appenFloatingBox () {
    var floatingBox = document.createElement("div");
    floatingBox.id = "floating-box";
    // floatingBox.style.display = "none";
    floatingBox.innerHTML = `
      <div id="floating-box-content">
        <p id="floating-box-content-text"></p>
        <button id="close-button">X</button>
      </div>
    `;
    document.body.appendChild(floatingBox);

    var floatingBoxStyle = document.createElement("style");
    floatingBoxStyle.innerHTML = `
      #floating-box {
        position: fixed;
        top: 10px;
        right: 10px;
        width: 380px;
        background-color: white;
        border: 1px solid gray;
        border-radius: 5px;
        box-shadow: 0 0 5px gray;
        z-index: 9999;
        overflow: auto;
        max-height: 100%;
      }

      #floating-box-content {
        padding: 10px;
      }

      #expand-button,
      #close-button {
        position: absolute;
        top: 0px;
        right: 0px;
        margin: 5px;
        padding: 5px;
        border-radius: 5px;
        border: 1px solid gray;
        background-color: white;
        color: black;
        cursor: pointer;
      }

      #expand-button:hover,
      #close-button:hover {
        background-color: gray;
        color: white;
      }
    `;
    document.head.appendChild(floatingBoxStyle);
    //  事件
    var expandButton = document.getElementById("expand-button");
    expandButton && expandButton.addEventListener("click", function() {
      // 展开全部的处理逻辑
    });
    var closeButton = document.getElementById("close-button");
    closeButton && closeButton.addEventListener("click", function() {
      floatingBox.style.display = "none"; // 隐藏悬浮窗口
    });
}


function updateText(info) {
  var displayText = info.text;
  var floatingBox = document.getElementById("floating-box");
  if (!floatingBox) {
    appenFloatingBox();
    floatingBox = document.getElementById("floating-box");
  }
  floatingBox.style.display = "block";
  var floatingBoxContentText = document.getElementById("floating-box-content-text");
  floatingBoxContentText.innerText = displayText;
  console.log('show_popup');
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'show_popup') {
    updateText(request.info);
  } else if (request.action === 'show_alert') {
    alert('正在解析中，请稍候...');
  }
});


