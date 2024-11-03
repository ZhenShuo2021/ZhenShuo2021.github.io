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

之前發現 Queue 原來可以拿來配合 threading 作為一個任務監聽器使用的，原本想寫一個 Python Queue 的小介紹，結果码农高天也剛好拍了[一部影片](https://www.youtube.com/watch?v=Qsa3xZgDUh4)來介紹 Queue，難道我除了[天使模式](https://docs.zsl0621.cc/memo/python/first-attempt-strategy-pattern#%E5%BE%8C%E8%A9%B1)以外還有共時性嗎！！！好可怕啊 Python。

![共時性](共時性.jpg)

會想寫文章介紹 Queue 的原因不意外的又是網路上的教學錯了，尼馬ㄉ給我說 Queue 不是 thread-safe，bro 你寫教學前敢不敢先看一下文檔...

既然文章沒得寫了這裡丟一下自己寫的任務監聽器。

```py
# Generic type for task input and task result
TI = TypeVar("TI", bound=Any)
TR = TypeVar("TR", bound=Any)


@dataclass
class ThreadJob(Generic[TI]):
    """Generic task container."""

    task_id: str
    params: TI
    job: Union[Callable[..., TR], Any] = None  # type: ignore


class ThreadingService(Generic[TI, TR]):
    """Generic service for processing tasks with multiple workers."""

    def __init__(self, logger: logging.Logger, num_workers: int = 1):
        self.task_queue: Queue[Optional[ThreadJob[TI]]] = Queue()
        self.logger = logger
        self.num_workers = num_workers
        self.worker_threads: list[threading.Thread] = []
        self.results: dict[str, TR] = {}
        self._lock = threading.Lock()

    def start_workers(self):
        """Start up multiple worker threads to listen for tasks."""
        for _ in range(self.num_workers):
            worker = threading.Thread(target=self._task_worker, daemon=True)
            self.worker_threads.append(worker)
            worker.start()

    def _task_worker(self):
        """Worker function to process tasks from the queue."""
        while True:
            task = self.task_queue.get()
            if task is None:
                break  # exit signal received

            try:
                if task.job:
                    result: Any = task.job(task.task_id, task.params, self.logger)
                    with self._lock:
                        self.results[task.task_id] = result
            except Exception as e:
                self.logger.error("Error processing task %s: %s", task.task_id, e)
            finally:
                self.task_queue.task_done()

    def add_task(self, task_id: str, params: TI, job: Any) -> None:
        """Add task to queue with specific parameters and job."""
        task = ThreadJob(task_id=task_id, params=params, job=job)
        self.task_queue.put(task)

    def get_result(self, task_id: str) -> Optional[TR]:
        """Get the result of a specific task."""
        with self._lock:
            return self.results.get(task_id)

    def wait_completion(self):
        """Block until all tasks are done and stop all workers."""
        self.task_queue.join()

        # Signal all workers to exit
        for _ in range(self.num_workers):
            self.task_queue.put(None)

        # Wait for all worker threads to finish
        for worker in self.worker_threads:
            worker.join()
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
