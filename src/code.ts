import {
  Observable,
  fromEvent,
  Subject,
  BehaviorSubject,
  ReplaySubject,
  AsyncSubject,
  merge,
  map,
  from,
  skipUntil,
} from "rxjs";

//Observable
const course1 = () => {
  let observable = new Observable((observer: any) => {
    try {
      observer.next("Hey guys!");
      observer.next("How are you?");
      setInterval(() => {
        observer.next("I am good");
      }, 2000);
      // observer.complete();
      // observer.next("This will not send");
    } catch (err) {
      observer.error(err);
    }
  });

  let observer = observable.subscribe(
    (data) => {
      addItem(data);
    },
    (err) => {
      addItem(err);
    },
    () => {
      addItem("Complete");
    }
  );
  // let observer2 = observable.subscribe(
  //   (data) => {
  //     addItem(data);
  //   },
  // );

  // observer.add(observer2)

  setTimeout(() => {
    // observer.unsubscribe();
    let observer2 = observable.subscribe((data: any) => {
      addItem("Subscript 2" + data);
    });
  }, 1000);
};

//fromEvent
const course2 = () => {
  let observable = fromEvent(document, "mousemove");

  setTimeout(() => {
    let subscription = observable.subscribe((data) => addItem(data));
  }, 2000);
};

//Subject
const course3 = () => {
  let subject = new Subject();

  let observer1 = subject.subscribe(
    (data) => addItem("Observer 1:" + data),
    (err) => addItem(err),
    () => addItem("Observer 1 Completed")
  );
  subject.next("The first thing has been sent");

  let observer2 = subject.subscribe((data) => addItem("Observer 2:" + data));

  subject.next("The second thing has been sent");
  subject.next("The second thing has been sent");
  observer2.unsubscribe();
  subject.next("The final thing has been sent");
};

//BehaviorSubject
const course4 = () => {
  let subject = new BehaviorSubject("First");

  let observer1 = subject.subscribe(
    (data) => addItem("Observer 1:" + data),
    (err) => addItem(err),
    () => addItem("Observer 1 Completed")
  );
  subject.next("The first thing has been sent");
  subject.next("...Observer 2 is about to subscribe...");

  let observer2 = subject.subscribe((data) => addItem("Observer 2:" + data));

  subject.next("The second thing has been sent");
  subject.next("The second thing has been sent");
  observer2.unsubscribe();
  subject.next("The final thing has been sent");
};

//ReplaySubject 1
const course5 = () => {
  let subject = new ReplaySubject(2);

  let observer1 = subject.subscribe(
    (data) => addItem("Observer 1:" + data),
    (err) => addItem(err),
    () => addItem("Observer 1 Completed")
  );
  subject.next("The first thing has been sent");
  subject.next("Another thing has been sent");
  subject.next("...Observer 2 is about to subscribe...");

  let observer2 = subject.subscribe((data) => addItem("Observer 2:" + data));

  subject.next("The second thing has been sent");
  subject.next("The second thing has been sent");
  observer2.unsubscribe();
  subject.next("The final thing has been sent");
};

//ReplaySubject 2
const course6 = () => {
  let subject = new ReplaySubject(30, 5000);

  let observer1 = subject.subscribe(
    (data) => addItem("Observer 1:" + data),
    (err) => addItem(err),
    () => addItem("Observer 1 Completed")
  );

  let i = 1;
  let int = setInterval(() => subject.next(i++), 1000);

  setTimeout(() => {
    let observer2 = subject.subscribe((data) => addItem("Observer 2:" + data));
  }, 5000);
};

//AsyncSubject
const course7 = () => {
  let subject = new AsyncSubject();

  let observer1 = subject.subscribe(
    (data) => addItem("Observer 1:" + data),
    () => addItem("Observer 1 Completed")
  );

  let i = 1;
  let int = setInterval(() => subject.next(i++), 1000);

  setTimeout(() => {
    let observer2 = subject.subscribe((data) => addItem("Observer 1:" + data));
    subject.complete();
  }, 5000);
};

//merge
const course8 = () => {
  let observable = new Observable((observer: any) => {
    observer.next("Hey guys!");
  });

  let observable2 = new Observable((observer: any) => {
    observer.next("How is it going?");
  });

  let newObs = merge(observable, observable2);

  newObs.subscribe((data) => addItem(data));
};

//map
const course9 = () => {
  let observable = new Observable((observer: any) => {
    observer.next("Hey guys!");
  });

  let observer1 = observable
    .pipe(map((data: any) => data.toUpperCase()))
    .subscribe((data) => addItem("Observer 1:" + data));
};

//skipUntil
const course10 = () => {
  let observable = new Observable((data) => {
    let i = 1;
    setInterval(() => {
      data.next(i++);
    }, 1000);
  });
  
  let observable2 = new Subject();
  
  setTimeout(() => {
    observable2.next("Hey!");
  }, 3000);
  
  let newObs = observable
    .pipe(skipUntil(observable2))
    .subscribe((data) => addItem(data));
}

function addItem(val: any) {
  let node = document.createElement("li");
  let textnode = document.createTextNode(val);
  node.append(textnode);
  document.getElementById("output").appendChild(node);
}
