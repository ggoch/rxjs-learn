import {
  Subject,
  EMPTY,
  of,
  filter,
  range,
  iif,
  throwError,
  map,
  from,
  fromEvent,
  fromEventPattern,
  interval,
  timer,
  defer,
  concat,
  Observable,
  merge,
  zip,
  partition,
  combineLatest,
  take,
  forkJoin,
  race,
  BehaviorSubject,
  scan,
  pairwise,
  switchMap,
  concatMap,
  mergeMap,
} from "rxjs";
import { ajax } from "rxjs/ajax";

interface ItestOperator {
  test(): void;
}

namespace RxjsOperator {
  class baseOperatorClass implements ItestOperator {
    fn: Function;
    subject$: Subject<any> = new Subject<any>();
    _behaviorSubject$: BehaviorSubject<any>;
    // private _subject$: Subject<any> = new Subject<any>();

    // get subject$(){
    //     return this._subject$.asObservable();
    // }
    constructor(fn: Function) {
      this.fn = fn;
    }

    set behaviorSubject$(value: any) {
      this._behaviorSubject$ = new BehaviorSubject<any>(value);
    }

    get behaviorSubject$(): BehaviorSubject<any> {
      return this._behaviorSubject$;
    }

    test() {
      this.fn();
    }
  }

  // EMPTY 就是一個空的 Observable，沒有任何事件，就直接結束了
  // 會直接執行complete
  export class Empty extends baseOperatorClass {
    constructor() {
      super(() => {
        this.opEmpty();
      });
    }

    // 彈珠圖
    // |
    opEmpty() {
      //   EMPTY.subscribe({
      //     next: (data) => console.log(data),
      //     complete: () => console.log("complete"),
      //   });
      EMPTY.subscribe({
        next: (data) => addItem(data),
        complete: () => addItem("complete"),
      });
    }
  }

  // of 基本上非常簡單，就是將傳進去的值當作一條 Observable，當值都發送完後結束
  // of 也可以帶入多個值，當訂閱發生時這些值會各自送出 (next())，然後結束
  export class Of extends baseOperatorClass {
    constructor() {
      super(() => {
        this.opOf();
      });
    }

    opOf() {
      // 彈珠圖
      // (1|)
      //   of(1).subscribe((data) => console.log(`of 範例: ${data}`));
      of(1).subscribe((data) => addItem(`of 範例: ${data}`));

      // 彈珠圖
      // (1234|)
      //   of(1, 2, 3, 4).subscribe((data) => console.log(`of 範例: ${data}`));
      of(1, 2, 3, 4).subscribe((data) => addItem(`of 範例: ${data}`));
    }
  }

  // range 是依照一個範圍內的數列資料建立 Observable，包含兩個參數：

  // start: 從哪個數值開始
  // count: 建立多少個數值的數列
  export class Range extends baseOperatorClass {
    constructor() {
      super(() => {
        this.opRange();
      });
    }

    opRange() {
      // 彈珠圖
      // (3456|)
      //   range(3, 4).subscribe(data => console.log(`range 範例: ${data}`));
      range(3, 4).subscribe((data) => addItem(`range 範例: ${data}`));
    }
  }

  // iif 會透過條件來決定產生怎麼樣的 Observable，有三個參數：

  // condition: 傳入一個 function，這個 function 會回傳布林值。
  // trueResult: 當呼叫 condition 參數的 function 回傳 true 時，使用 trueResult 的 Observable
  // falseResult: 當呼叫 condition 參數的 function 回傳 false 時，使用 falseResult 的 Observable
  export class Iif extends baseOperatorClass {
    constructor(num: number = -1) {
      super(() => {
        this.opIif(num);
      });
    }

    opIif(num: number) {
      this.emitOneIfEven$(num).subscribe((data) => {
        // console.log(`iif 範例: ${data}`)
        addItem(`iif 範例: ${data}`);
      });
    }

    emitOneIfEven$(num: number) {
      return iif(() => num % 2 === 0, of("even"), of("no"));
    }
  }

  // throwError 就是用來讓整條 Observable 發生錯誤 (error()) 用的！
  // 因此訂閱時要記得使用 error 來處理，同時當錯誤發生時，就不會有「完成」發生
  // 在pipe裡其實可以直接使用throw new Error('');
  export class ThrowError extends baseOperatorClass {
    constructor(errMessage: string = "") {
      super(() => {
        this.opThrowError(errMessage);
      });
    }

    // 彈珠圖
    // #
    opThrowError(errMessage: string) {
      let err$ = throwError(() => {
        const error: any = new Error(`throwError 範例 (error): ${errMessage}`);
        return error;
      });
      err$.subscribe({
        error: (err) => {
          //   console.log(err);
          addItem(err);
        },
      });
    }
  }

  // ajax 算是比較特殊的工具 operator，放在 rjxs/ajax 下
  // ，是用來發送 HTTP 請求抓 API 資料的，會回傳 ajaxResponse 格式！
  // 例如以下程式會使用 ajax 抓取 RxJS 在 GitHub 上的 issues
  // ajax 除了單純傳入網址，用 GET 方法取得資料外，
  // 也可以改成傳入一個 ajaxRequest 設定物件，來控制 GET 或 POST 等方法，或是設定 headers、body等資訊
  export class Ajax extends baseOperatorClass {
    constructor(url?: string) {
      super(() => {
        this.opAjax(url);
      });
    }

    opAjax(url?: string) {
      let source$ = ajax({
        url: url || "https://api.github.com/repos/reactivex/rxjs/issues",
        method: "GET",
      });
      source$.subscribe((result) => {
        console.log(result);
        // addItem(result);
      });
    }
  }

  // from 算是使用機會不低的 operator，它可以接受的參數類型包含陣列、
  // 可疊代的物件 (iterable)、Promise 和「其他 Observable 實作」 等等，
  // from 會根據傳遞進來的參數決定要如何建立一個新的 Observable。
  // 跟of 非常的像，差別在只是 from 會將陣列內的內容一個一個傳遞給訂閱的觀察者。
  export class From extends baseOperatorClass {
    constructor() {
      super(() => {
        this.opFrom();
      });
    }

    opFrom() {
      // 彈珠圖
      // (1234|)
      from([1, 2, 3, 4]).subscribe((data) => {
        // console.log(`from 示範 (1): ${data}`);
        addItem(`from 示範 (1): ${data}`);
      });
      from(range(2, 6)).subscribe((data) => {
        // console.log(`from 示範 (2): ${data}`);
        addItem(`from 示範 (2): ${data}`);
      });
      // 傳入 Promise 當參數
      from(Promise.resolve(1)).subscribe((data) => {
        // console.log(`from 示範 (3): ${data}`);
        addItem(`from 示範 (3): ${data}`);
      });
      // from 也可以把一個 Observable 當作參數，
      // 此時 from 會幫我們訂閱裡面的資料，重新組成新的 Observable
      from(of(1, 2, 3, 4)).subscribe((data) => {
        // console.log(`from 示範 (4): ${data}`)
        addItem(`from 示範 (4): ${data}`);
      });
    }

    // 使用 generator 建立 iterable
    *range(start: number, count: number) {
      while (start < count) {
        yield start;
        start++;
      }
    }
  }

  // fromEvent 是能將瀏覽器事件包裝成 Observable，參數有兩個：

  // target：實際上要監聽事件的 DOM 元素
  // eventName：事件名稱
  export class FromEvent extends baseOperatorClass {
    constructor(target: any = document, eventName: string = "click") {
      super(() => {
        this.opFromEvent(target, eventName);
      });
    }

    opFromEvent(target: any, eventName: string) {
      fromEvent(target, eventName).subscribe((data) => {
        // console.log('fromEvent 示範: 滑鼠事件觸發了');
        addItem("fromEvent 示範: 滑鼠事件觸發了");
      });
    }
  }

  // fromEventPattern 可以根據自訂的邏輯決定事件發生，只要我們將邏輯寫好就好；fromEventPattern 需要傳入兩個參數：

  // addHandler：當 subscribe 時，呼叫此方法決定如何處理事件邏輯
  // removeHandler：當 unsubscribe 時，呼叫此方法將原來的事件邏輯取消
  export class FromEventPattern extends baseOperatorClass {
    constructor(eventName: string = "click") {
      super(() => {
        this.opFromEventPattern(eventName);
      });
    }

    opFromEventPattern(eventName: string) {
      const addHandler = (handler: Function) => {
        console.log("fromEventPattern 示範: 自定義註冊滑鼠事件");
        document.addEventListener(eventName, (event) => handler(event));
      };
      const removeHandler = (handler: Function) => {
        console.log("fromEventPattern 示範: 自定義取消滑鼠事件");
        document.removeEventListener(eventName, (event) => handler(event));
      };

      const source$ = fromEventPattern(addHandler, removeHandler);

      const subscription = source$.subscribe((event) => {
        console.log(`fromEventPattern 示範: 滑鼠事件發生了,${event}`);
        addItem(`fromEventPattern 示範: 滑鼠事件發生了,${event}`);
      });

      setTimeout(() => {
        subscription.unsubscribe();
      }, 3000);
    }
  }

  // interval 會依照的參數設定的時間 (毫秒) 來建立 Observable，當被訂閱時，
  // 就會每隔一段指定的時間發生一次資料流，資料流的值就是為事件是第幾次發生的 (從 0 開始)
  // 在取消訂閱前，事件都會持續發生，當然我們可以在一段時間後把它取消訂閱來結束 Observable
  export class Interval extends baseOperatorClass {
    constructor(number: number = 1000) {
      super(() => {
        this.opInterval(number);
      });
    }

    opInterval(number: number) {
      // 彈珠圖
      //----0----1----2----3----.......
      //interval(1000).subscribe((index) => {})

      // 彈珠圖
      //----0----1----2----3----4--|
      const subscription = interval(number).subscribe((index) => {
        // console.log(`interval 示範: ${index}`)
        addItem(`interval 示範: ${index}`);
      });

      setTimeout(() => {
        subscription.unsubscribe();
      }, 5500);
    }
  }

  // timer 跟 interval 有點類似，但它多一個參數，用來設定經過多久時間後開始依照指定的間隔時間計時
  // interval 有個小缺點，就是一開始一定會先等待一個指定時間，才會發生第一個事件，
  // 但有時候我們會希望一開始就發生事件，這個問題可以透過 timer 解決，只要等待時間設為 0 即可
  export class Timer extends baseOperatorClass {
    constructor(delay: number = 3000, time?: number) {
      super(() => {
        this.opTimer(delay, time);
      });
    }

    opTimer(delay: number, time?: number) {
      // 彈珠圖
      //--------------------0-----1-----2--......
      // ＾ 經過 3000 毫秒
      // 以下範例會在 3000 毫秒後開始以每 1000 毫秒一個新事件的頻率計時
      timer(delay, time || 1000).subscribe((data) => {
        // console.log(`timer 示範 (1): ${data}`)
        addItem(`timer 示範 (1): ${data}`);
      });

      // 彈珠圖
      //--------------------0|
      //   timer 如果沒有設定第二個參數，代表在指定的時間發生第一次事件後，就不會再發生任何事件了
      timer(delay).subscribe((data) => {
        // console.log(`timer 示範 (2): ${data}`);
        addItem(`timer 示範 (2): ${data}`);
      });
    }
  }

  // defer 會將建立 Observable 的邏輯包裝起來，
  // 使用 defer 時需要傳入一個 factroy function 當作參數，
  // 這個 function 裡面需要回傳一個 Observable (或 Promise 也行)，
  // 當 defer 建立的 Observable 被訂閱時，會呼叫這個 factroy function，
  // 並以裡面回傳的 Observer 當作資料流
  export class Defer extends baseOperatorClass {
    constructor() {
      super(() => {
        this.opDefer();
      });
    }

    opDefer() {
      const factory = () => of(1, 2, 3);
      const source$ = defer(factory);

      source$.subscribe((data) => {
        // console.log(`defer 示範: ${data}`);
        addItem(`defer 示範: ${data}`);
      });

      // source$ 每次被訂閱時才會去呼叫裡面 factroy function，
      // 這麼做的好處是建立 Observable 的邏輯被包裝起來了，
      // 同時也可以達成延遲執行的目標。
      // 以上面的程式碼，其實不使用 defer 也沒什麼問題
      // const factory = () => of(1, 2, 3);
      // factory().subscribe(data => console.log(`defer 示範: ${data}`));
      // 改上面寫法也行

      // 那麼為什麼還要用 defer 呢？有一個很重要的目標是「延遲執行」，
      // 如果今天產生 Observable 的邏輯希望在「訂閱」時才去執行的話，
      // 就很適合使用 defer，
      // 最常見的例子應該非 Promise 莫屬了！
      // Promise 雖然是非同步執行程式，但在 Promise 產生的一瞬間相關程式就已經在運作了

      const p = new Promise((resolve) => {
        // console.log("Promise start");
        addItem("Promise start");
        setTimeout(() => {
          resolve(100);
        }, 1000);
      }).then((result) => {
        // console.log(result);
        addItem(result);
      });
      // Promise 內被執行了
      // (就算還沒呼叫 .then，程式依然會被執行)

      // 就算用 from 包起來變成 Observable，已經執行的程式依然已經被執行了，
      // 呼叫 .then() 不過是再把 resolve() 的結果拿出來而已
      // 在設計 Observable 時如果可以延遲執行，直到被訂閱時才真的去執行相關邏輯，
      // 通常會比較好釐清整個流程，此時 defer 就可以幫我們達到這個目標

      // 將 Promise 包成起來
      // 因此在此 function 被呼叫前，都不會執行 Promise 內的程式
      const promiseFactory = () => {
        return new Promise((resolve) => {
          //   console.log("Promise 內被執行了");
          addItem("Promise 內被執行了");
          setTimeout(() => {
            resolve(100);
          }, 1000);
        });
      };
      const deferSource$ = defer(promiseFactory);
      // 此時 Promise 內程式依然不會被呼叫
      //   console.log("示範用 defer 解決 Promise 的問題:");
      addItem("示範用 defer 解決 Promise 的問題:");
      // 直到被訂閱了，才會呼叫裡面的 Promise 內的程式
      deferSource$.subscribe((result) => {
        console.log(`Promise 結果: ${result}`);
        addItem(`Promise 結果: ${result}`);
      });
    }
  }

  // concat 可以將數個 Observables 組合成一個新的 Observable，
  // 並且在每個 Observable 結束後才接續執行下一個 Observable
  // 要注意的是，由於一定會等到目前 Observable 結束才繼續，
  // 因此在設計來源 Observable 時，一定要將「結束」這件事情考量在內，
  // 當然不是一定要結束，畢竟這關係到 Observable 本身的流程設計，
  // 但常見的一個小錯誤是用了不會結束的 Observable 如 interval 或使用 Subject 卻忘了呼叫 complete()，
  // 結果永遠等不到下一個 Observable 執行的情況
  export class Concat extends baseOperatorClass {
    constructor(...observable: Observable<any>[]) {
      super(() => {
        this.opConcat(...observable);
      });
    }

    //彈珠圖
    // sourceA$: 1------2------|
    // sourceB$: 3------4------|
    // sourceC$: 5------6------|
    //  concat(sourceA$, sourceB$, source$)
    // (sourceA$)    (sourceB$)    (sourceC$)
    // 1------2------3------4------5------6------|
    //              ^ 到這裡 sourceA$ 結束，接續下一個 sourceB$
    //                            ^ 到這裡 sourceB$ 結束，接續下一個 sourceC$
    opConcat(...observable: Observable<any>[]) {
      const sourceA$ = of(1, 2);
      const sourceB$ = of(3, 4);
      const sourceC$ = of(5, 6);

      concat(sourceA$, sourceB$, sourceC$, ...observable).subscribe((data) => {
        // console.log(data);
        addItem(data);
      });
    }
  }

  // merge 跟 concat 類似，但會同時啟動參數內所有的 Observable，因此會有「平行處理」的感覺
  export class Merge extends baseOperatorClass {
    constructor(...observable: Observable<any>[]) {
      super(() => {
        this.opMerge(...observable);
      });
    }

    //彈珠圖
    // sourceA$: --A1--A2--A3--A4--A5--A6--....
    // sourceB$: ----------B1----------B2--...
    // sourceC$: ------------------C1------....

    // merge(sourceA$, sourceB$, sourceC$)

    // --A1--A2--(A3,B1)--A4--(A5,C1)--(A6,B2)------.......
    // 為了方便解釋，每個從上面的彈珠圖可以看到

    // 第 1、2 秒時，各自會產生 sourceA$ 的 A1 和 A2 事件
    // 第三秒時 sourceA$ 和 sourceB$ 同時分別發生了 A3 和 B1 事件
    // 第五秒時 sourceA$ 和 sourceC$ 同時分別發生了 A5 和 C1 事件
    // 第六秒時 sourceA$ 和 sourceB$ 同時分別發生了 A6 和 B2 事件
    // 之所以會這樣是因為 sourceA$、sourceB$ 和 sourceC$ 是同時開始的，只是透過 merge 組合成一條 Observable
    opMerge(...observable: Observable<any>[]) {
      const sourceA$ = interval(1000).pipe(map((data) => `A${data}`));

      const sourceB$ = interval(3000).pipe(map((data) => `B${data}`));

      const sourceC$ = interval(5000).pipe(map((data) => `C${data}`));

      const subscription = merge(
        sourceA$,
        sourceB$,
        sourceC$,
        ...observable
      ).subscribe((data) => {
        // console.log(`merge 範例： ${data}`);
        addItem(`merge 範例： ${data}`);
      });
    }
  }

  // zip 是拉鍊的意思，拉鍊是把兩個鏈條合併在一起，
  // 且資料是「一組一組合併在一起的」，實際上在使用時，
  // zip 會將傳入的 Observables 依次組合在一起成為一個陣列，已經被組合過的就不會再次被組合
  export class Zip extends baseOperatorClass {
    constructor(...observable: Observable<any>[]) {
      super(() => {
        this.opZip(...observable);
      });
    }

    //彈珠圖
    // sourceA$: --A1--A2--A3--A4--............
    // sourceB$:   ----B1  ----B2  ----B3--....
    // sourceC$:     ------C1    ------C2    ------C3......

    // zip(sourceA$, sourceB$, sourceC$)
    //               ------**    ------**    ------**.......
    //                 [A1,B1,C1]  [A2,B2,C2]  [A3,B3,C3]

    // 述例子中，前三個發生過的事件會各自被組合起來，
    // 而 sourceA$ 和 sourceB$ 雖然都有第四次事件，
    // 但因為 sourceC$ 沒有第四次事件，所以沒有成功組合成新的資料

    // 這邊彈珠圖刻意把時間拉開一點，
    // 讓各位可以注意到合併的感覺是依照事件發生的次序進行合併的，
    // 也就是「所有第一次發生的事件」會合併成一組，「所有第二次發生的事件」會合併成另外一組，以此類推
    opZip(...observable: Observable<any>[]) {
      const sourceA$ = interval(1000).pipe(map((data) => `A${data + 1}`));
      const sourceB$ = interval(2000).pipe(map((data) => `B${data + 1}`));
      const sourceC$ = interval(3000).pipe(map((data) => `C${data + 1}`));

      zip(sourceA$, sourceB$, sourceC$, ...observable).subscribe((data) => {
        // console.log(`zip 範例: ${data}`)
        addItem(`zip 範例: ${data}`);
      });
    }
  }

  // 前面介紹的都是將多個 Observable 組合成一條新的 Observable，
  // 只是順序和處理資料的方式不同，而 partition 則是將 Observable 依照規則拆成兩條 Observable。
  // partition 需要兩個參數：

  // source: 來源 Observable
  // predicate: 用來拆分的條件，是一個 function，每次事件發生都會將資料傳入此 function，
  // 並會傳是否符合條件 (true/false)，符合條件的(true)會被歸到一條 Observable，
  // 不符合條件的則被歸到另外一條 Observable
  export class Partition extends baseOperatorClass {
    constructor(
      observable: Observable<any> = of(1, 2, 3, 4, 5, 6),
      fn: Function = (data: number) => data % 2 === 0
    ) {
      super(() => {
        this.opPartition(observable, fn);
      });
    }

    //彈珠圖
    // source$:     -----1-----2-----3-----4-----5-----6-----|

    // [sourceEven$, sourceOdd$] = partition(source$, (data) => data % 2 === 0);

    // sourceEven$: -----------2----------4------------6-----|
    // sourceOdd$:  -----1------------3----------5-----------|
    opPartition(observable: Observable<any>, fn: any) {
      const [sourceEven$, sourceOdd$] = partition(observable, fn);

      sourceEven$.subscribe((data) => {
        // console.log(`partition 範例 (偶數): ${data}`)
        addItem(`partition 範例 (偶數): ${data}`);
      });
      sourceOdd$.subscribe((data) => {
        // console.log(`partition 範例 (奇數): ${data}`)
        addItem(`partition 範例 (奇數): ${data}`);
      });
    }

    // 在 SPA 架構盛行的現在，我們常常會在網頁上管理各種狀態，
    // 像是「登入」和「登出」等狀態，如果我們希望兩種狀態有各自不同的情境處理時，
    // 就可以用 partition 切成兩條 Observable，然後各自只要專注在處理各自的邏輯就好囉
    // const isLogin$ = interval(1000).pipe(
    //   map((_, index) => index % 2 === 0)
    // );

    // const [login$, logout$] = partition(
    //   isLogin$,
    //   (data) => data
    // );

    // login$.subscribe(() => console.log('我又登入囉！'));
    // logout$.subscribe(() => console.log('我又登出啦！'));
  }

  // combineLatest 跟之前介紹過的 zip 非常像，差別在於 zip 會依序組合，
  // 而 combineLatest 會在資料流有事件發生時，
  // 直接跟目前其他資料流的「最後一個事件」組合在一起，
  // 也因此這個 operator 是 latest 結尾，另一個不同的地方是，
  // comeintLatest 內的參數是一個 Observable 陣列，訂閱後會把陣列內的這些 Observables 組合起來
  export class CombineLatest extends baseOperatorClass {
    constructor(...observable: Observable<any>[]) {
      super(() => {
        this.opCombineLatest(...observable);
      });
    }

    // 彈珠圖
    // sourceA$: --A1--A2--A3        --A4        --A5......
    // sourceB$:   ----B1            --B2        ....
    // sourceC$:     ------C1

    // combineLatest(sourceA$, sourceB$, sourceC$)
    //               ------**        --**        --**.......
    //                 [A3,B1,C1]  [A4,B1,C1]
    //                             [A4,B2,C1] (兩個來源 Observable 同時發生事件)

    // 從結果可以看到每次有事件發生時都會將其他 Observable 最後發生的事件值組合起來，
    // 而 A1 發生時，因為其他 Observable 還沒有任何新事件，
    // 因此沒有辦法組合，所以直到 C1 發生時，全部 Observable 都有「最後一次事件值」，才進行組合
    opCombineLatest(...observable: Observable<any>[]) {
      const sourceA$ = interval(1000).pipe(map((data) => `A${data + 1}`));
      const sourceB$ = interval(2000).pipe(map((data) => `B${data + 1}`));
      const sourceC$ = interval(3000).pipe(map((data) => `C${data + 1}`));

      const subscription = combineLatest([
        sourceA$,
        sourceB$,
        sourceC$,
        ...observable,
      ]).subscribe((data) => {
        // console.log(`combineLatest 範例: ${data}`)
        addItem(`combineLatest 範例: ${data}`);
      });
    }
  }

  // forkJoin 會同時訂閱傳入的 Observables，
  // 直到每個 Observable 都「結束」後，將每個 Observable 的「最後一筆值」組合起來
  export class ForkJoin extends baseOperatorClass {
    constructor(...observable: Observable<any>[]) {
      super(() => {
        this.opForkJoin(...observable);
      });
    }

    // 彈珠圖
    // sourceA$: --A1--A2--A3--A4--A5|
    // sourceB$: ------B1  ----B2  ----B3  ----B4|
    // sourceC$:     ------C1    ------C2    ------C3|

    // forkJoin(sourceA$, sourceB$, sourceC#)
    //               ------      ------      ------**|
    //                                         [A5,B3,C3]
    // 最後結束的會是sourceC$ 的 C3，
    // 此時 sourceA$ 和 sourceB 都已經結束了，
    // 事件值分別是 A5 和 B4，因此最後訂閱時會得到一個 [A5, B4, C3] 然後結束
    opForkJoin(...observable: Observable<any>[]) {
      //take 這個 operators 會在事件發生指定次數後結束整個 Observable
      const sourceA$ = interval(1000).pipe(
        map((data) => `A${data + 1}`),
        take(5)
      );
      const sourceB$ = interval(2000).pipe(
        map((data) => `B${data + 1}`),
        take(4)
      );
      const sourceC$ = interval(3000).pipe(
        map((data) => `C${data + 1}`),
        take(3)
      );

      forkJoin([sourceA$, sourceB$, sourceC$, ...observable]).subscribe({
        next: (data) => {
          // console.log(`forkJoin 範例: ${data}`)
          addItem(`forkJoin 範例: ${data}`);
        },
        complete: () => {
          // console.log('forkJoin 結束')
          addItem("forkJoin 結束");
        },
      });
    }

    // 在實務上，我們會使用 forkJoin 去平行發送多個沒有順序性的 HTTP 請求，
    // 因為 HTTP 請求只會發生一次回傳就結束，
    // 如果每個請求之前沒有順序性，那麼一起發送會是比較快可以拿到全部資料的方法，例如：
    // const profile$ = ajax('/me/rofile');
    // const friends$ = ajax('/me/friends');

    // forkJoin(profile$, friend$).subscribe((profile, friends) => {
    // 同時處理 profile 和 friends 資料
    // });
  }

  // race 本身就有「競速」的意思，因此這個 operator 接受的參數一樣是數個 Observables，
  // 當訂閱發生時，這些 Observables 會同時開跑，
  // 當其中一個 Observable 率先發生事件後，就會以這個 Observable 為主，
  // 並退訂其他的 Observables，也就是先到先贏，其他都是輸家
  export class Race extends baseOperatorClass {
    constructor(...observable: Observable<any>[]) {
      super(() => {
        this.opRace(...observable);
      });
    }

    //彈珠圖
    // sourceA$: --A1--A2--A3.....
    // sourceB$:   ----B1.........
    // sourceC$:     ------C1.....

    // race(sourceA$, sourceB$, sourceC$)
    //           --A1--A2--A3.....
    //             ^ sourceA$ 先到了，因此退訂 sourceB$ 和 sourceC$
    opRace(...observable: Observable<any>[]) {
      const sourceA$ = interval(1000).pipe(map((data) => `A${data + 1}`));
      const sourceB$ = interval(2000).pipe(map((data) => `B${data + 1}`));
      const sourceC$ = interval(3000).pipe(map((data) => `C${data + 1}`));

      const subscription = race([
        sourceA$,
        sourceB$,
        sourceC$,
        ...observable,
      ]).subscribe((data) => {
        // console.log(`race 範例: ${data}`)
        addItem(`race 範例: ${data}`);
      });
    }
  }

  // map 在實務上使用的頻率可以說是壓倒性的高，
  // 因為它最直覺好懂，也是許多 operators 的基礎，
  // 也就是說光是懂得如何善用 map operator，就可以完成非常非常多的功能，
  // 許多其他的 operaotrs 功能其實都可以使用 map 來完成
  export class Map extends baseOperatorClass {
    constructor(value?: any, fn?: any) {
      super(() => {
        this.opMap(value, fn);
      });
    }

    //彈珠圖
    // 1    2    3    4|
    // map(value => value * 2)
    // 2    4    6    8|
    // map 內除了傳入每次事件值以外，還可以傳入一個 index 參數，
    // 代表目前的值是 Observable 第幾次發生的事件
    opMap(value?: any, fn?: any) {
      const exampleFunction = (data: any) => {
        return data * 2;
      };
      const exampleFunction2 = (data: any, index: any) => {
        return `第 ${index} 次事件資料為 ${data}`;
      };
      const inputValue = value || 10;
      this.behaviorSubject$ = inputValue;
      this.behaviorSubject$.pipe(map(exampleFunction)).subscribe((value) => {
        // console.log(`map 示範 (1): ${value}`)
        addItem(`map 示範 (1): ${value}`);
      });
      this.behaviorSubject$.next(inputValue);
      this.behaviorSubject$
        .pipe(map(fn || exampleFunction2))
        .subscribe((message) => {
          console.log(`map 示範 (2): ${message}`);
          addItem(`map 示範 (2): ${message}`);
        });
    }

    // 對 JavaScript 陣列操作熟悉的朋友應該也不難發現，這跟陣列的 map 方法非常幾乎一模一樣，唯一的差別只在

    // Observable 的 map 是每次有事件發生時進行轉換。
    // 陣列的 map 會立刻把整個了陣列的資料勁行轉換
  }

  // scan 需要傳入兩個參數

  // 累加函數：這個函數被呼叫時會傳入三個參數，可以搭配這三個參數處理資料後回傳一個累加結果，函數參數包含
  // acc：目前的累加值，也就是上一次呼叫累加函數時回傳的結果
  // value：目前事件值
  // index：目前事件 index
  // 初始值
  export class Scan extends baseOperatorClass {
    constructor(
      fn: any = (acc: any, value: any) => acc + value,
      initValue?: any,
      donateAmount?: any[]
    ) {
      super(() => {
        this.opScan(fn, initValue, donateAmount);
      });
    }

    //彈珠圖
    // (100      500      300      250|)
    // scan((acc, value) => acc + value, 0)
    // (100      600      900     1150|)
    //     scan 跟 map 蠻像的，但 scan 可以根據我們的條件保留上一次的狀態，
    //     方便我們進行其他的處理。另外還有一個 operator 叫做 reduce 行為幾乎一樣，但只會回傳結束時的加總結果
    opScan(fn?: any, initValue?: any, donateAmount?: any[]) {
      const accumDonate$ = of(...(donateAmount || [100, 500, 300, 250])).pipe(
        scan(
          fn, // 累加函數
          initValue || 0 // 初始值
        )
      );

      accumDonate$.subscribe((amount) => {
        // console.log(`目前 donate 金額累計: ${amount}`)
        addItem(`目前 donate 金額累計: ${amount}`);
      });
    }
  }

  // pairwise 可以將 Observable 的事件資料「成雙成對」的輸出，
  // 這個 operator 沒有任何參數，因為他只需要 Observable 作為資料來源就足夠了
  // pairwise 會將「目前事件資料」和上一次「事件資料」組成一個長度 2 的陣列，
  // 值得注意的是，因為「第一次」事件發生時，
  // 沒有「上一次」事件，因此輸出結果的數量永遠會比總是件數量少一次
  export class Pairwise extends baseOperatorClass {
    constructor(...value: any) {
      super(() => {
        this.opPairwise(...value);
      });
    }

    //彈珠圖
    // (      1      2      3      4      5      6|)
    // pairwise()
    // (           [1,2]  [2,3]  [3,4]  [4,4]  [5,6]|)
    //       ^ 第一次事件發生時會被過濾掉
    opPairwise(...value: any) {
      of(1, 2, 3, 4, 5, 6, ...value)
        .pipe(pairwise())
        .subscribe((data) => {
          // console.log(`pairwise 示範 (1): ${data}`);
          addItem(`pairwise 示範 (1): ${data}`);
        });
    }
  }

  // switchMap 內是一個 project function 傳入的參數為前一個 Observable 的事件值，
  // 同時必須回傳一個 Observable
  // 因此可以幫助我們把來源事件值換成另外一個 Observable，
  // 而 switchMap 收到這個 Observable 後會幫我們進行訂閱的動作，再把訂閱結果當作新的事件值

  // source$ ------ 1--  ----- 3--  ----- 5-------|
  // project = (i) = i*10--i*10|

  // source$.pipe(switchMap(project))

  //         ------10--10-----30--30-----50--50---|
  //                ^ source$ 發出事件 1，轉換成 10--10|
  //                           ^ source$ 發出事件 3，轉換成 30--30|
  //                                      ^ source$ 發出事件 5，轉換成 50--50|

  // switchMap 還有另外一個重點，就是「切換」(switch)的概念，
  // 當來源 Observable 有新的事件時，
  // 如果上一次轉換的 Observable 還沒完成，
  // 會退訂上一次的資料流，並改用新的 Observable 資料流
  export class SwitchMap extends baseOperatorClass {
    constructor() {
      super(() => {
        this.opSwitchMap();
      });
    }

    //彈珠圖
    // interval$ ---0---1---2---3---4...

    // switchMap(x => timer$ 0-1-2...)

    // 0---1---2---0---1---2...

    // 來源 Observable (interval(0, 3000)) 每次有新事件發生時，
    // 會產生新的 Observable (timer(0, 1000))，
    // 如果上一次 Observable 沒有完成，會被退訂閱掉，
    // 「切換」成新的 Observable。因此每次都只會產生 0, 1, 2 的循環
    opSwitchMap() {
      interval(3000)
        .pipe(
          switchMap(() => {
            return timer(0, 1000);
          })
        )
        .subscribe((data) => {
          // console.log(data);
          addItem(data);
        });
    }
  }

  // concatMap 一樣在每次事件發生時都會產生新的 Observable，
  // 不過 concatMap 會等前面的 Observable 結束後，才會「接續」(concat)新產生的 Observable 資料流

  // interval(3000).pipe(
  //   concatMap(() => timer(0, 1000))
  // ).subscribe(data => {
  //   console.log(data);
  // });
  // 0
  // 1
  // 2
  // 3
  // 4
  // 5
  // 6
  // (不會結束...）

  // 上面的程式碼中，由於 concatMap 轉換了一個沒有結束機會的 Observable，
  // 因此來源 Observable (interval(3000)) 雖然持續有新事件，
  // 但卻因為上一次的 Observable 沒有發生而無法繼續

  // 在使用 concatMap 時，轉換後的 Observable 基本上都必須設定結束條件，
  // 也就是要確保會完成 (complete)，否則很容易就會產生不可預期的問題(就是一直不會結束...)
  export class ConcatMap extends baseOperatorClass {
    constructor() {
      super(() => {
        this.opConcatMap();
      });
    }

    //彈珠圖

    // source1$ -----0-----1-----2-----3.....
    // source2$ -0-1-2-3-4|

    // source1$.pipe(concatMap(() => source2$))

    //          -------0-1-2-3-4-0-1-2-3-4-0-1-2-3-4-0-1-2-3-4
    //                 ^ source1$ 的事件 0，換成 source2$ 資料流
    //                     ^ source1$ 的事件 1，但上一次資料流還沒結束，等待中
    //                         ^ source1$ 事件 0 轉換的資料流結束，開始新的資料流

    // 當每個資料流都非常重要不可取消，且必須照著順序執行時，使用 concatMap 就對了
    opConcatMap() {
      const source1$ = interval(3000);
      const source2$ = timer(0, 3000).pipe(take(5));
      /*take給個數字在執行跟數字依樣的次數後complete*/

      source1$
        .pipe(
          concatMap(() => {
            return source2$;
          })
        )
        .subscribe((data) => {
          // console.log(data);
          addItem(data);
        });
    }
  }

  // mergeMap 會把所有被轉換成的 Observable 「合併」(merge)到同一條資料流內，
  // 因此會有平行處理的概念，也就是每此轉換的 Observable 都會直接訂閱，
  // 不會退訂上一次的 Observable，也不會等待上一次的 Observable 結束，
  // 因此任何目前存在中的 Observable 資料流有新事件，都會被轉換成整體資料流的事件
  export class MergeMap extends baseOperatorClass {
    constructor() {
      super(() => {
        this.opMergeMap();
      });
    }

    // mergeMap 很適合用來顯示一些即時的訊息，例如聊天室功能，
    // 每當一個新的使用者加入聊天室，原始 Observable 就會有新的事件，
    // 在使用 mergeMap 轉換成這個使用者的最新訊息，
    // 如此一來不管哪個使用者輸入新的聊天訊息，都會即時的呈現囉！

    // 不過也要注意的是，第一次按下按鈕時呼叫 API 時，若還沒有資料回傳，
    // 在按下一次按鈕時，會同時有兩個 API 請求呼叫，
    // 此時因為網路不一定會照請求順序回傳的關係，有可能反而造成舊資料蓋掉新資料的問題，因為順序是不可控制的
    opMergeMap() {
      const source1$ = timer(0, 3000);
      const getSource2 = (input: any) =>
        timer(0, 1500).pipe(map((data) => `資料流 ${input}: ${data}`));

      source1$
        .pipe(
          mergeMap((data) => {
            return getSource2(data);
          })
        )
        .subscribe((data) => {
          // console.log(data);
          addItem(data);
        });
    }
  }
}

function testOperator<T extends ItestOperator>(
  target: T,
  ...muiltTarget: ItestOperator[]
) {
  target.test();
  if (muiltTarget) {
    for (let target of muiltTarget) {
      target.test();
    }
  }
}

testOperator(new RxjsOperator.Ajax(),);

function addItem(val: any) {
  let node = document.createElement("li");
  let textnode = document.createTextNode(val);
  node.append(textnode);
  document.getElementById("output").appendChild(node);
}
