import { increment, serverTimestamp } from "firebase/firestore";
import { deleteData, getData, searchData, setData, updateData } from "./fb/db";
import { auth } from "./fb/auth";
import { EDIT_COMMENT_TYPE, NEW_COMMENT_TYPE } from "../types/comment";

// --------------------------------------- C ---------------------------------------
export const writeComment = async (args: NEW_COMMENT_TYPE) => {
  args.uid = args.uid || auth.currentUser?.uid;
  args.author = args.author || auth.currentUser?.displayName || undefined;
  //parent Id가 있으면 답글입니다~ post Id는 필수입니다!

  for (const key in args) {
    if (!args[key]) {
      if (key === "parentId") {
        args.parentId = null;
      } else {
        console.error(`${key} is missing`);
        return false;
      }
    }
  }

  const { uid, author, postId, ...commentInfo } = args;

  const data = {
    uid,
    author,
    postId,
    ...commentInfo,
    timestamp: serverTimestamp(),
  };

  const result = await setData(data, "comment");
  const result2 = await updateData({ comments: increment(1) }, "post", postId);

  return result && result2;
};

// --------------------------------------- R ---------------------------------------
export const getCommentById = async (commentId: string) => {
  const result = await getData("comments", commentId);

  return result;
};

export const getCommentsByUid = async (uid?: string) => {
  uid = uid || auth.currentUser?.uid;

  const result = await searchData("comments", ["uid", "==", uid]);
  result.map((doc) => {
    doc.commentId = doc.id;
    delete doc.id;
    return doc;
  });

  return result;
};

export const getCommentsByPostId = async (postId: string) => {
  const temp = await searchData("comments", ["postId", "==", postId]);

  const result = temp.map((doc) => {
    doc.commentId = doc.id;
    delete doc.id;
    return doc;
  });

  return result;
};

// --------------------------------------- U ---------------------------------------
export const editComment = async (args: EDIT_COMMENT_TYPE) => {
  for (const key in args) {
    if (!args[key]) {
      console.error(`${key} is missing`);
      return false;
    }
  }

  const { commentId, content } = args;

  const data = {
    content,
    editTime: serverTimestamp(),
  };

  const result = await updateData(data, "posts", commentId);

  return result;
};

// --------------------------------------- D ---------------------------------------
export const deleteComment = async (postId: string, commentId: string) => {
  const result = await deleteData("comments", commentId);
  const result2 = await updateData({ comments: increment(-1) }, "post", postId);

  return result && result2;
};
