const fs = require('fs').promises;
const path = require('path');
const cheerio = require('cheerio');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const { createHighlighter } = require('shiki');
const crypto = require('crypto');

const TARGET_DIR = 'public';
const ENABLE_DUAL_THEME = true;
const THREAD_COUNT = 4;
const BATCH_SIZE = 4;

// 語言別名映射
const LANGUAGE_ALIAS = {
  env: 'dotenv',
  node: 'js'
};

// 建立一個 Shiki 高亮器實例的單例 Promise
let highlighterInstance = null;

function getHighlighter() {
  if (!highlighterInstance) {
    highlighterInstance = createHighlighter({
      themes: ['github-light', 'github-dark'],
      langs: ['javascript', 'typescript', 'html', 'css', 'json', 'py', 'yaml', 'dotenv', 'sh', 'md', 'go', 'c', 'ini', 'toml', 'matlab', 'tex']
    });
  }
  return highlighterInstance;
}

// 高亮結果緩存
const highlightCache = new Map();

// 計算緩存鍵
function getCacheKey(code, lang, theme) {
  const hash = crypto.createHash('md5').update(`${code}-${lang}-${theme}`).digest('hex');
  return hash;
}

// 檢查文件是否需要處理 (基於修改時間)
const processedFiles = new Map();
async function shouldProcessFile(filePath) {
  try {
    const stats = await fs.stat(filePath);
    const lastModified = stats.mtimeMs;
    
    // 如果文件未被處理過或者已被修改，則需要處理
    if (!processedFiles.has(filePath) || processedFiles.get(filePath) < lastModified) {
      return true;
    }
    return false;
  } catch (error) {
    console.error(`檢查文件 ${filePath} 狀態時出錯:`, error);
    return true; // 出錯則重新處理
  }
}

// 主線程代碼
if (isMainThread) {
  async function main() {
    try {
      console.log('開始處理 HTML 文件...');
      
      // 獲取所有 HTML 文件作為線程安全的 Set 以防止重複
      const files = await getAllHtmlFiles(TARGET_DIR);
      const fileArray = Array.from(files);
      
      console.log(`找到 ${fileArray.length} 個 HTML 文件需要處理`);
      
      if (fileArray.length === 0) {
        console.log('沒有找到 HTML 文件。退出。');
        return;
      }
      
      // 先初始化高亮器以便所有工作線程共用
      console.log('初始化 Shiki 高亮器...');
      const highlighter = await getHighlighter();
      console.log('高亮器初始化完成');
      
      // 創建共享的任務隊列
      const jobQueue = [...fileArray];
      const completedJobs = { count: 0 };
      
      // 創建工作線程
      const workers = [];
      const workerCount = Math.min(THREAD_COUNT, Math.ceil(fileArray.length / 2));
      
      console.log(`啟動 ${workerCount} 個工作線程`);
      
      for (let i = 0; i < workerCount; i++) {
        const worker = new Worker(__filename, {
          workerData: { 
            workerId: i,
            isWorker: true
          }
        });
        
        worker.on('message', (message) => {
          if (message.type === 'completed') {
            completedJobs.count += message.count;
            console.log(`工作線程 ${message.workerId} 完成了 ${message.count} 個文件。進度: ${completedJobs.count}/${fileArray.length} (${Math.round(completedJobs.count / fileArray.length * 100)}%)`);
            
            // 分配更多任務如果有的話
            const nextBatch = jobQueue.splice(0, BATCH_SIZE);
            if (nextBatch.length > 0) {
              worker.postMessage({ type: 'process', files: nextBatch });
            } else {
              worker.postMessage({ type: 'exit' });
            }
          } else if (message.type === 'cacheUpdate') {
            // 將高亮緩存同步到主線程
            for (const [key, value] of Object.entries(message.cacheEntries)) {
              highlightCache.set(key, value);
            }
          }
        });
        
        worker.on('error', (err) => {
          console.error(`工作線程 ${i} 錯誤:`, err);
        });
        
        worker.on('exit', (code) => {
          workers.splice(workers.indexOf(worker), 1);
          console.log(`工作線程 ${i} 退出，代碼 ${code}`);
          
          if (workers.length === 0) {
            console.log('所有工作線程已完成。代碼高亮處理結束。');
            // 優化：保存處理記錄以便下次增量處理
            saveProcessedFiles();
          }
        });
        
        // 分配初始批次文件給工作線程
        const initialBatch = jobQueue.splice(0, BATCH_SIZE);
        if (initialBatch.length > 0) {
          worker.postMessage({ 
            type: 'process', 
            files: initialBatch,
            // 將主線程上的緩存傳遞到工作線程
            sharedCache: Object.fromEntries(highlightCache)
          });
        } else {
          worker.postMessage({ type: 'exit' });
        }
        
        workers.push(worker);
      }
    } catch (error) {
      console.error('主線程錯誤:', error);
    }
  }
  
  async function getAllHtmlFiles(dir) {
    try {
      const filesSet = new Set(); // 使用 Set 防止重複
      await collectHtmlFiles(dir, filesSet);
      return filesSet;
    } catch (error) {
      console.error('收集 HTML 文件時出錯:', error);
      return new Set();
    }
  }
  
  async function collectHtmlFiles(dir, filesSet) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          await collectHtmlFiles(fullPath, filesSet);
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
          filesSet.add(fullPath);
        }
      }
    } catch (error) {
      console.error(`讀取目錄 ${dir} 時出錯:`, error);
    }
  }
  
  // 保存已處理文件記錄
  async function saveProcessedFiles() {
    try {
      const recordFile = path.join(__dirname, '.processed-files.json');
      const records = Object.fromEntries(processedFiles);
      await fs.writeFile(recordFile, JSON.stringify(records, null, 2), 'utf8');
      console.log(`處理記錄已保存到 ${recordFile}`);
    } catch (error) {
      console.error('保存處理記錄時出錯:', error);
    }
  }
  
  // 加載已處理文件記錄
  async function loadProcessedFiles() {
    try {
      const recordFile = path.join(__dirname, '.processed-files.json');
      const data = await fs.readFile(recordFile, 'utf8');
      const records = JSON.parse(data);
      
      for (const [file, timestamp] of Object.entries(records)) {
        processedFiles.set(file, timestamp);
      }
      
      console.log(`已加載 ${processedFiles.size} 條處理記錄`);
    } catch (error) {
      // 如果文件不存在或讀取錯誤，則忽略
      console.log('未找到處理記錄，將重新處理所有文件');
    }
  }
  
  // 啟動前加載處理記錄
  loadProcessedFiles().then(main);
} 
// 工作線程代碼
else {
  const { workerId, isWorker } = workerData;
  // 工作線程的高亮緩存
  const localHighlightCache = new Map();
  
  async function initialize() {
    try {
      // 使用主線程已初始化的高亮器
      const highlighter = await getHighlighter();
      
      parentPort.on('message', async (message) => {
        if (message.type === 'process') {
          const files = message.files;
          let processedCount = 0;
          
          // 接收主線程共享的緩存
          if (message.sharedCache) {
            for (const [key, value] of Object.entries(message.sharedCache)) {
              localHighlightCache.set(key, value);
            }
          }
          
          const batchStartTime = Date.now();
          const newCacheEntries = {};
          
          for (const file of files) {
            try {
              // 檢查文件是否需要處理
              if (await shouldProcessFile(file)) {
                const modifications = await processFile(file, highlighter);
                if (modifications > 0) {
                  processedCount++;
                  // 更新文件處理時間戳
                  processedFiles.set(file, Date.now());
                  
                  // 收集新的緩存條目
                  localHighlightCache.forEach((value, key) => {
                    if (!message.sharedCache || !message.sharedCache[key]) {
                      newCacheEntries[key] = value;
                    }
                  });
                }
              }
            } catch (error) {
              console.error(`工作線程 ${workerId} 處理 ${file} 時出錯:`, error);
            }
          }
          
          const batchTime = Date.now() - batchStartTime;
          console.log(`工作線程 ${workerId} 完成批次處理，耗時 ${batchTime}ms`);
          
          // 同步新緩存條目到主線程
          if (Object.keys(newCacheEntries).length > 0) {
            parentPort.postMessage({
              type: 'cacheUpdate',
              cacheEntries: newCacheEntries
            });
          }
          
          parentPort.postMessage({ 
            type: 'completed', 
            workerId, 
            count: processedCount 
          });
        } else if (message.type === 'exit') {
          process.exit(0);
        }
      });
      
      console.log(`工作線程 ${workerId} 已初始化並準備就緒`);
    } catch (error) {
      console.error(`工作線程 ${workerId} 初始化錯誤:`, error);
      process.exit(1);
    }
  }
  
  async function processFile(filePath, highlighter) {
    // 讀取文件內容
    const htmlContent = await fs.readFile(filePath, 'utf8');
    
    // 簡單檢查是否需要處理
    if (!htmlContent.includes('<pre><code') && !htmlContent.includes('<pre class="shiki')) {
      return 0;
    }
    
    // 使用 cheerio 解析 HTML
    const $ = cheerio.load(htmlContent, { decodeEntities: false });
    
    // 查找所有代碼塊
    const codeBlocks = $('pre > code');
    if (codeBlocks.length === 0) return 0;
    
    let modificationsCount = 0;
    const modifications = [];
    
    // 批量處理代碼塊，先收集所有需要修改的塊
    for (let i = 0; i < codeBlocks.length; i++) {
      const codeBlock = codeBlocks.eq(i);
      const pre = codeBlock.parent();
      
      // 如果已經處理過，跳過
      if (pre.hasClass('shiki')) {
        continue;
      }
      
      const rawCode = codeBlock.text();
      if (!rawCode.trim()) continue;
      
      let lang = codeBlock.attr('class')?.replace(/^language-/, '') || 'text';
      lang = LANGUAGE_ALIAS[lang] || lang;
      
      // 緩存鍵
      const lightKey = getCacheKey(rawCode, lang, 'github-light');
      const darkKey = ENABLE_DUAL_THEME ? getCacheKey(rawCode, lang, 'github-dark') : null;
      
      // 檢查緩存
      let lightHtml = localHighlightCache.get(lightKey);
      let darkHtml = darkKey ? localHighlightCache.get(darkKey) : null;
      
      // 不在緩存中則生成
      if (!lightHtml) {
        lightHtml = highlighter.codeToHtml(rawCode, {
          lang,
          theme: 'github-light'
        });
        localHighlightCache.set(lightKey, lightHtml);
      }
      
      if (ENABLE_DUAL_THEME && !darkHtml) {
        darkHtml = highlighter.codeToHtml(rawCode, {
          lang,
          theme: 'github-dark'
        });
        localHighlightCache.set(darkKey, darkHtml);
      }
      
      // 收集修改信息
      modifications.push({
        pre,
        lightHtml,
        darkHtml
      });
      
      modificationsCount++;
    }
    
    // 如果沒有需要修改的，直接返回
    if (modifications.length === 0) {
      return 0;
    }
    
    // 批量應用所有修改
    for (const mod of modifications) {
      if (ENABLE_DUAL_THEME) {
        applyDualTheme(mod.pre, mod.lightHtml, mod.darkHtml, $);
      } else {
        const $highlighted = cheerio.load(mod.lightHtml, { decodeEntities: false });
        mod.pre.replaceWith($highlighted('pre'));
      }
    }
    
    // 一次性寫入文件
    await fs.writeFile(filePath, $.html(), 'utf8');
    
    return modificationsCount;
  }
  
  // 應用雙主題高亮
  function applyDualTheme(pre, lightHtml, darkHtml, $) {
    const $light = cheerio.load(lightHtml, { decodeEntities: false });
    const $dark = cheerio.load(darkHtml, { decodeEntities: false });
    
    const $lightPre = $light('pre');
    const $darkPre = $dark('pre');
    
    const mergedPre = $('<pre></pre>')
      .addClass('shiki shiki-themes github-light github-dark')
      .attr('tabindex', '0')
      .html($lightPre.html());
    
    const bgLight = $lightPre.css('background-color');
    const fgLight = $lightPre.css('color');
    const bgDark = $darkPre.css('background-color');
    const fgDark = $darkPre.css('color');
    
    mergedPre.attr('style', `
      background-color: ${bgLight};
      color: ${fgLight};
      --shiki-dark-bg: ${bgDark};
      --shiki-dark: ${fgDark};
    `.trim());
    
    // 批量處理所有 span 元素，優化 DOM 操作
    const lightSpans = $lightPre.find('span').toArray();
    const darkSpans = $darkPre.find('span').toArray();
    const mergedHtml = mergedPre.html();
    
    // 使用單一正則表達式替換，而不是逐個替換
    let spanIndex = 0;
    const newHtml = mergedHtml.replace(/<span[^>]*style="([^"]*)"([^>]*)>/g, (match, style, rest) => {
      const darkColor = $(darkSpans[spanIndex]).css('color');
      spanIndex++;
      if (darkColor) {
        return `<span style="${style}; --shiki-dark: ${darkColor}"${rest}>`;
      }
      return match;
    });
    
    mergedPre.html(newHtml);
    pre.replaceWith(mergedPre);
  }
  
  if (isWorker) {
    initialize().catch(error => {
      console.error(`工作線程 ${workerId} 初始化失敗:`, error);
      process.exit(1);
    });
  }
}