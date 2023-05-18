

window.onload = ()=> {
  // 读取数据
  chrome.storage.local.get(["key", "prompt"], function(result) {
    document.getElementById("key").value = result.key || "";
    document.getElementById("prompt").value = result.prompt || "";
  });

  // 保存数据
  document.getElementById("options-form").addEventListener("submit", function(event) {
    event.preventDefault();
    
    var key = document.getElementById("key").value;
    var prompt = document.getElementById("prompt").value;
    
    chrome.storage.local.set({key: key, prompt: prompt}, function() {
      alert("数据保存成功");
      window.close();
    });
  });
}