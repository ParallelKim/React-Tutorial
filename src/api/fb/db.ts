import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
  DocumentData,
  setDoc,
  updateDoc,
  query,
  where,
  WhereFilterOp,
  deleteDoc,
  orderBy,
  limit,
  startAfter,
  endBefore,
} from "firebase/firestore";
import { app } from "./app";

const db = getFirestore(app);

export const createNewDocId = (path?: string) => {
  return doc(collection(db, path ?? "it is not important actually")).id;
};

export const setData = async (data: object, ...path: string[]) => {
  const isDoc = path.length > 1;

  let ref;

  if (isDoc) {
    ref = doc(db, path[0], ...path.slice(1));
  } else {
    ref = doc(collection(db, path[0]));
  }

  return setDoc(ref, data, { merge: true })
    .then(() => {
      console.log("successfully upload data");
      return true;
    })
    .catch(() => {
      console.error("fail to upload data");
      return false;
    });
};

export const getData = async (...path: string[]) => {
  const isDoc = path.length > 1;

  let returnVal = null;

  if (isDoc) {
    const snap = await getDoc(doc(db, path[0], ...path.slice(1)));
    if (snap.exists()) {
      returnVal = snap.data();
    }
  } else {
    const snap = await getDocs(collection(db, path[0]));

    const temp: DocumentData[] = [];
    snap.forEach((doc) => {
      temp.push(doc.data());
    });

    return temp;
  }

  return returnVal;
};

export const searchData = async (
  path: string,
  condition: [string, WhereFilterOp, unknown]
) => {
  const q = query(collection(db, path), where(...condition));
  const querySnapshot = await getDocs(q).catch((err) => {
    console.error("error occured while search data", err);
    return [];
  });

  const temp: DocumentData[] = [];

  querySnapshot.forEach((doc) => {
    temp.push({ id: doc.id, ...doc.data() });
  });

  return temp;
};

export const orderData = async (
  path: string,
  orderKey: string,
  limitKey?: number
) => {
  const q = limitKey
    ? query(collection(db, path), orderBy(orderKey), limit(limitKey))
    : query(collection(db, path), orderBy(orderKey));

  const querySnapshot = await getDocs(q).catch((err) => {
    console.error("error occured while search data", err);
    return [];
  });

  const temp: DocumentData[] = [];

  querySnapshot.forEach((doc) => {
    temp.push({ id: doc.id, ...doc.data() });
  });

  return temp;
};

export const pagenationData = async (
  path: string,
  orderKey: string,
  limitKey: number,
  lastVisibleDoc?: unknown
) => {
  const q = lastVisibleDoc
    ? query(
        collection(db, path),
        orderBy(orderKey, "desc"),
        endBefore(lastVisibleDoc),
        limit(limitKey)
      )
    : query(collection(db, path), orderBy(orderKey, "desc"), limit(limitKey));

  console.log(lastVisibleDoc);

  const querySnapshot = await getDocs(q).catch((err) => {
    console.error("error occured while search data", err);
    return [];
  });

  const temp: { datas: DocumentData[]; last: unknown } = {
    datas: [],
    last: null,
  };
  let cnt = 0;

  querySnapshot.forEach((doc) => {
    temp.datas.push({ id: doc.id, ...doc.data() });
    cnt++;
  });

  temp.last = temp.datas[cnt - 1];

  return temp;
};

export const complexData = async (
  path: string,
  condition: [string, WhereFilterOp, unknown],
  orderKey: string,
  limitKey: number,
  lastVisibleDoc?: unknown
) => {
  const q = lastVisibleDoc
    ? query(
        collection(db, path),
        where(...condition),
        startAfter(lastVisibleDoc)
      )
    : query(collection(db, path), where(...condition));

  const querySnapshot = await getDocs(q).catch((err) => {
    console.error("error occured while search data", err);
    return [];
  });

  const temp: { datas: DocumentData[]; last: unknown } = {
    datas: [],
    last: null,
  };
  let cnt = 0;

  querySnapshot.forEach((doc) => {
    temp.datas.push({ id: doc.id, ...doc.data() });
    cnt++;
  });

  temp.datas
    .sort((a, b) => a.timestamp - b.timestamp)
    .sort((a, b) => b[orderKey] - a[orderKey]);
  temp.datas.slice(0, limitKey);
  temp.last = temp.datas[cnt - 1];

  return temp;
};


export const updateData = async (data: object, ...path: string[]) => {
  const isDoc = path.length > 1;

  let ref;

  if (isDoc) {
    ref = doc(db, path[0], ...path.slice(1));
  } else {
    ref = doc(collection(db, path[0]));
  }

  return updateDoc(ref, data)
    .then(() => {
      console.log("successfully update data");
      return true;
    })
    .catch(() => {
      console.error("fail to update data");
      return false;
    });
};

export const deleteData = async (...path: string[]) => {
  const isDoc = path.length > 1;

  let ref;

  if (isDoc) {
    ref = doc(db, path[0], ...path.slice(1));
  } else {
    ref = doc(collection(db, path[0]));
  }

  return deleteDoc(ref)
    .then((res) => {
      console.log("successfully delete data", res);
      return true;
    })
    .catch((err) => {
      console.error("fail to delete data", err);
      return false;
    });
};

