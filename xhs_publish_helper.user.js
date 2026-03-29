// ==UserScript==
// @name         小红书一键发布助手
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  小红书创作者平台一键发布助手 - 自动填充标题、正文、话题
// @author       尼古拉斯
// @match        *://creator.xiaohongshu.com/*
// @grant        none
// ==/UserScript==
(function() {
    'use strict';
    var style = document.createElement('style');
    style.textContent = '#xhs-helper-panel{position:fixed;top:10px;right:10px;width:320px;max-height:90vh;background:linear-gradient(135deg,#ff6b6b 0%,#ee5a5a 100%);border-radius:16px;box-shadow:0 8px 32px rgba(255,107,107,0.3);z-index:999999;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;overflow:hidden;transition:all 0.3s ease}#xhs-helper-panel.minimized{width:60px;height:60px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:24px}#xhs-helper-panel.minimized .xhs-panel-content{display:none}#xhs-helper-panel *{box-sizing:border-box}#xhs-helper-header{background:rgba(255,255,255,0.15);padding:14px 16px;display:flex;justify-content:space-between;align-items:center;cursor:move}#xhs-helper-title{color:#fff;font-size:15px;font-weight:600;margin:0}#xhs-helper-minimize{background:rgba(255,255,255,0.2);border:none;color:#fff;width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:16px;transition:background 0.2s}#xhs-helper-minimize:hover{background:rgba(255,255,255,0.3)}#xhs-helper-body{padding:16px;max-height:calc(90vh - 100px);overflow-y:auto;background:#fff}#xhs-helper-body::-webkit-scrollbar{width:6px}#xhs-helper-body::-webkit-scrollbar-track{background:rgba(0,0,0,0.05);border-radius:3px}#xhs-helper-body::-webkit-scrollbar-thumb{background:rgba(255,107,107,0.4);border-radius:3px}.xhs-field-group{margin-bottom:14px}.xhs-field-label{color:#444;font-size:13px;font-weight:500;margin-bottom:6px;display:block}.xhs-field-input{width:100%;padding:10px 12px;border:2px solid #f0f0f0;border-radius:10px;font-size:14px;transition:border-color 0.2s;outline:none}.xhs-field-input:focus{border-color:#ff6b6b}.xhs-textarea{width:100%;min-height:120px;padding:10px 12px;border:2px solid #f0f0f0;border-radius:10px;font-size:14px;resize:vertical;outline:none;font-family:inherit;line-height:1.5}.xhs-textarea:focus{border-color:#ff6b6b}.xhs-btn-group{display:flex;gap:8px;margin-top:14px}.xhs-btn{background:linear-gradient(135deg,#ff6b6b,#ee5a5a);color:#fff;border:none;padding:11px 18px;border-radius:10px;font-size:14px;font-weight:500;cursor:pointer;transition:all 0.2s;flex:1}.xhs-btn:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(255,107,107,0.4)}.xhs-btn:active{transform:translateY(0)}.xhs-btn-secondary{background:#f5f5f5;color:#666}.xhs-btn-secondary:hover{background:#eee;box-shadow:none}.xhs-hint{background:#fff9f9;border-left:3px solid #ff6b6b;padding:10px 12px;border-radius:0 8px 8px 0;font-size:12px;color:#888;margin-top:14px;line-height:1.5}.xhs-success{background:#f0fdf4;border-color:#22c55e;color:#166534}';
    document.head.appendChild(style);
    var panel = document.createElement('div');
    panel.id = 'xhs-helper-panel';
    panel.innerHTML = '<div id="xhs-helper-header"><span id="xhs-helper-title">小红书发布助手</span><button id="xhs-helper-minimize">-</button></div><div class="xhs-panel-content"><div id="xhs-helper-body"><div class="xhs-field-group"><label class="xhs-field-label">标题</label><input type="text" id="xhs-title" class="xhs-field-input" placeholder="输入笔记标题"></div><div class="xhs-field-group"><label class="xhs-field-label">正文内容</label><textarea id="xhs-content" class="xhs-textarea" placeholder="输入正文内容..."></textarea></div><div class="xhs-field-group"><label class="xhs-field-label">话题标签（用逗号分隔）</label><input type="text" id="xhs-topics" class="xhs-field-input" placeholder="例如：生活好物,居家必备,收纳神器"></textarea></div><div class="xhs-btn-group"><button id="xhs-fill-btn" class="xhs-btn">填充页面</button><button id="xhs-clear-btn" class="xhs-btn xhs-btn-secondary">清空</button></div><div class="xhs-hint">提示：填写完成后点击"填充页面"，助手将自动为您填入小红书发布表单。</div></div></div>';
    document.body.appendChild(panel);
    var isDragging = false;
    var dragOffsetX = 0;
    var dragOffsetY = 0;
    var header = document.getElementById('xhs-helper-header');
    header.addEventListener('mousedown', function(e) {
        if (e.target.tagName === 'BUTTON') return;
        isDragging = true;
        dragOffsetX = e.clientX - panel.offsetLeft;
        dragOffsetY = e.clientY - panel.offsetTop;
    });
    document.addEventListener('mousemove', function(e) {
        if (isDragging) {
            panel.style.left = (e.clientX - dragOffsetX) + 'px';
            panel.style.top = (e.clientY - dragOffsetY) + 'px';
            panel.style.right = 'auto';
        }
    });
    document.addEventListener('mouseup', function() { isDragging = false; });
    document.getElementById('xhs-helper-minimize').addEventListener('click', function() {
        panel.classList.toggle('minimized');
        this.textContent = panel.classList.contains('minimized') ? '+' : '-';
    });
    document.getElementById('xhs-clear-btn').addEventListener('click', function() {
        document.getElementById('xhs-title').value = '';
        document.getElementById('xhs-content').value = '';
        document.getElementById('xhs-topics').value = '';
    });
    document.getElementById('xhs-fill-btn').addEventListener('click', function() {
        var title = document.getElementById('xhs-title').value;
        var content = document.getElementById('xhs-content').value;
        var topicsInput = document.getElementById('xhs-topics').value;
        var btn = this;
        btn.textContent = '填充中...';
        btn.disabled = true;
        setTimeout(function() {
            var titleInput = document.querySelector('input[placeholder*="标题"], input[aria-label*="标题"], .title-input, input[data-element-selectable]');
            if (titleInput) {
                titleInput.value = title;
                titleInput.dispatchEvent(new Event('input', { bubbles: true }));
                titleInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
            var contentInput = document.querySelector('textarea[placeholder*="正文"], textarea[aria-label*="正文"], .note-content, div[contenteditable="true"]');
            if (contentInput) {
                if (contentInput.getAttribute('contenteditable') === 'true') {
                    contentInput.textContent = content;
                    contentInput.dispatchEvent(new Event('input', { bubbles: true }));
                } else {
                    contentInput.value = content;
                    contentInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }
            if (topicsInput.trim()) {
                var topics = topicsInput.split(',').map(function(t) { return t.trim(); }).filter(function(t) { return t; });
                var lastInput = null;
                topics.forEach(function(topic) {
                    var topicBtn = document.querySelector('div[role="button"]:has-text("#' + topic + '"), span:has-text("#' + topic + '")');
                    if (topicBtn) {
                        topicBtn.click();
                    } else {
                        var addTopicBtn = document.querySelector('div[role="button"][aria-label*="话题"], button:has-text("添加话题"), span:has-text("添加话题")');
                        if (addTopicBtn) {
                            addTopicBtn.click();
                            setTimeout(function() {
                                var topicInput = document.querySelector('input[placeholder*="搜索"], input[aria-label*="话题"]');
                                if (topicInput) {
                                    topicInput.value = topic;
                                    topicInput.dispatchEvent(new Event('input', { bubbles: true }));
                                    setTimeout(function() {
                                        var selectTopic = document.querySelector('div[role="option"]:has-text("#' + topic + '"), div[role="option"]:first-child');
                                        if (selectTopic) selectTopic.click();
                                    }, 100);
                                }
                            }, 100);
                        }
                    }
                    lastInput = topicBtn;
                });
            }
            btn.textContent = '填充成功!';
            btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
            setTimeout(function() {
                btn.textContent = '填充页面';
                btn.style.background = '';
                btn.disabled = false;
            }, 1500);
        }, 300);
    });
    console.log('小红书发布助手已启动');
})();
