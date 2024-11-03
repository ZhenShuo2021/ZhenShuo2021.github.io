---
title: 20241103
date: 2024-11-03T19:39:32+08:00
draft: false
summary: 
showSummary: false
tags: ["隨筆", 廢文, 程式語言]
categories: ["隨筆"]
series: []
series_order: 
progress_bar: true
---

最近發現 Queue 原來可以配合多線程作為任務監聽器使用，就想寫一個 Python Queue 簡單介紹文章，結果码农高天也剛好拍了[一部影片](https://www.youtube.com/watch?v=Qsa3xZgDUh4)來介紹 Queue，難道這就是共時性嗎！！！好可怕啊 Python。


<div align="center">

![共時性](共時性.jpg)

</div>

會想寫文章的原因不意外的又是網路上的教學錯了，說 Queue 不是 thread-safe，bro 你寫教學前敢不敢先看一下文檔...

既然文章沒得寫了這裡丟一下自己寫的任務監聽器。

```py
# Generic type for task input and task result
TI = TypeVar("TI", bound=Any)
TR = TypeVar("TR", bound=Any)


@dataclass
class Task(Generic[TI]):
    """Generic task container."""

    task_id: str
    func: Callable[..., Any]
    args: tuple[Any, ...] = ()
    kwargs: dict[str, Any] | None = None

    def __post_init__(self) -> None:
        self.kwargs = self.kwargs or {}


class ThreadingService(Generic[TI, TR]):
    """Generic service for processing tasks with multiple workers."""

    def __init__(self, logger: Logger, max_workers: int = 5):
        self.task_queue: Queue[Task | None] = Queue()
        self.logger = logger
        self.max_workers = max_workers
        self.workers: list[threading.Thread] = []
        self.results: dict[str, Any] = {}
        self._lock = threading.Lock()
        self.is_running = False

    def start(self) -> None:
        if not self.is_running:
            self.is_running = True
            for _ in range(self.max_workers):
                worker = threading.Thread(target=self._process_tasks, daemon=True)
                self.workers.append(worker)
                worker.start()

    def add_task(self, task: Task) -> None:
        self.task_queue.put(task)
        if not self.is_running:
            self.start()

    def add_tasks(self, tasks: list[Task]) -> None:
        for task in tasks:
            self.task_queue.put(task)
        if not self.is_running:
            self.start()

    def get_result(self, task_id: str) -> Any | None:
        with self._lock:
            return self.results.pop(task_id, None)

    def get_results(self, max_results: int = 0) -> dict[str, Any]:
        with self._lock:
            if max_results <= 0:
                results_to_return = self.results.copy()
                self.results.clear()
                return results_to_return

            keys = list(self.results.keys())[:max_results]
            return {key: self.results.pop(key) for key in keys}

    def stop(self, timeout: int | None = None) -> None:
        self.task_queue.join()
        for _ in range(self.max_workers):
            self.task_queue.put(None)
        for worker in self.workers:
            worker.join(timeout=timeout)
        self.workers.clear()
        self.is_running = False

    def _process_tasks(self) -> None:
        while True:
            task = self.task_queue.get()
            if task is None:
                break

            try:
                result = task.func(*task.args, **task.kwargs)  # type: ignore
                with self._lock:
                    self.results[task.task_id] = result
            except Exception as e:
                self.logger.error("Error processing task %s: %s", task.task_id, e)
            finally:
                self.task_queue.task_done()
```

使用方式
```py
self.download_service.add_task(
    task_id="generate task id here",
    params=(
        album_name,
        image_links,
        self.config.download.download_dir,
        HEADERS,
        self.config.download.rate_limit,
        self.runtime_config.no_skip,
        self.logger,
    ),
    job=threading_download_job,
)
```

最後，Queue 是基於 deque 完成的，主要差別在於前者用於多線程任務的 FIFO 模型，後者則是一個單純的雙向佇列。
