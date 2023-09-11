import {
  DocumentData,
  arrayRemove,
  arrayUnion,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { EDIT_POST_TYPE, NEW_POST_TYPE } from "../types/post";
import {
  complexData,
  deleteData,
  getData,
  orderData,
  pagenationData,
  searchData,
  setData,
  updateData,
} from "./fb/db";
import { auth } from "./fb/auth";
import { getUserInfoByCustomId } from "./user";

// --------------------------------------- C ---------------------------------------
export const writePost = async (args: NEW_POST_TYPE) => {
  args.uid = args.uid || auth.currentUser?.uid;
  args.author = args.author || auth.currentUser?.displayName || undefined;
  args.address = args.address || `@${args.customId}/${args.title}`;
  args.summary = args.summary || args.content.substring(0, 150) + "...";

  for (const key in args) {
    if (!args[key]) {
      if (key === "seriesId") {
        args.seriesId = null;
      } else {
        console.error(`${key} is missing`);
        return false;
      }
    }
  }

  const { uid, author, postId, seriesId, ...postInfo } = args;

  const data = {
    uid,
    author,
    ...postInfo,
    timestamp: serverTimestamp(),
    views: 0,
    likes: 0,
    comments: 0,
  };

  const result = await setData(data, "posts", postId);
  if (seriesId)
    return (
      result &&
      (await setData({ posts: arrayUnion(postId) }, "series", seriesId))
    );

  return result;
};

// --------------------------------------- R ---------------------------------------
export const getPostById = async (postId: string) => {
  const result = await getData("posts", postId);

  if (result) {
    await updateData(
      {
        views: increment(1),
      },
      "posts",
      postId
    );

    if ((result as DocumentData).comments > 0) {
      const comments = await searchData("comments", ["postId", "==", postId]);
      comments.map((comment) => {
        comment.commentId = comment.id;
        delete comment.id;
        return comment;
      });

      (result as DocumentData).comments = comments;
    }
  }

  return result;
};

export const getDetailPostByTitle = async (customId: string, title: string) => {
  const temp = await getPostsByCustomId(customId);
  if (!temp) {
    console.error("customId is not found");
    return null;
  }
  const result = temp.filter((post) => {
    return post.title === title;
  });

  if (!result) {
    console.error("title is not found");
    return null;
  }

  return result;
};

export const getDetailPostByAdress = async (address: string) => {
  const temp = await searchData("posts", ["address", "==", address]);
  const post = temp[0];

  if (!post) {
    console.error("post for this adress is not found");
    return null;
  }

  post.postId = post.id;
  delete post.id;

  if (post.comments > 0) {
    const comments = await searchData("comments", [
      "postId",
      "==",
      post.postId,
    ]);
    comments.map((comment) => {
      comment.commentId = comment.id;
      delete comment.id;
      return comment;
    });

    post.commentList = comments;
  }

  return post;
};

export const getPostsByUid = async (uid?: string) => {
  uid = uid || auth.currentUser?.uid;

  let result;
  const temp = await searchData("posts", ["uid", "==", uid]);
  temp.map((post) => {
    post.postId = post.id;
    delete post.id;
    return post;
  });

  uid === auth.currentUser?.uid
    ? (result = temp.filter((post) => {
        return post.state !== "draft";
      }))
    : (result = temp.filter((post) => {
        return post.state === "published";
      }));
  return result;
};

export const getDrafts = async (uid?: string) => {
  uid = uid || auth.currentUser?.uid;

  if (uid !== auth.currentUser?.uid)
    return console.error("uid is not same with current user");

  const temp = await searchData("posts", ["uid", "==", uid]);
  temp.map((post) => {
    post.postId = post.id;
    delete post.id;
    return post;
  });
  const result = temp.filter((post) => {
    return post.state === "draft";
  });

  return result;
};

export const getPostsBySeriesId = async (seriesId: string) => {
  const temp = await searchData("posts", ["seriesId", "==", seriesId]);
  temp.map((post) => {
    post.postId = post.id;
    delete post.id;
    return post;
  });
  const result = temp.filter((post) => {
    return post.state === "published";
  });

  return result;
};

export const getPostsByTagName = async (tagName: string) => {
  const temp = await searchData("posts", ["tags", "array-contains", tagName]);
  temp.map((post) => {
    post.postId = post.id;
    delete post.id;
    return post;
  });
  const result = temp.filter((post) => {
    return post.state === "published";
  });

  return result;
};

export const getPostsByCustomId = async (customId: string) => {
  const user = await getUserInfoByCustomId(customId);

  if (!user) {
    console.error("user not found");
    return null;
  }

  let result = null;

  const temp = await searchData("posts", ["uid", "==", user.uid]);
  temp.map((post) => {
    post.postId = post.id;
    delete post.id;
    return post;
  });

  if (user.uid === auth.currentUser?.uid) {
    result = temp.filter((post) => {
      return post.state !== "draft";
    });
  } else {
    result = temp.filter((post) => {
      return post.state === "published";
    });
  }

  return result;
};

export const getRecentPosts = async () => {
  const temp = await orderData("posts", "timestamp");
  temp.map((post) => {
    post.postId = post.id;
    delete post.id;
    return post;
  });
  const result = temp.filter((post) => {
    return post.state === "published";
  });

  return result;
};

export const getRecentPage = async (
  lastVisibleDoc?: unknown,
  limitKey?: number
) => {
  const result = await pagenationData(
    "posts",
    "timestamp",
    limitKey ?? 30,
    lastVisibleDoc
  );

  result.datas.map((post) => {
    post.postId = post.id;
    delete post.id;
    return post;
  });

  result.datas = result.datas.filter((post) => {
    return post.state === "published";
  });

  return result;
};

type DURATION_TYPE = "day" | "week" | "month" | "year";

const DURATION_IN_MS: Record<DURATION_TYPE, number> = {
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  year: 365 * 24 * 60 * 60 * 1000,
};

export const getTrendingPage = async (
  duration: DURATION_TYPE,
  lastVisibleDoc?: unknown,
  limitKey?: number
) => {
  const result = await complexData(
    "posts",
    ["timestamp", ">=", new Date(Date.now() - DURATION_IN_MS[duration])],
    "likes",
    limitKey ?? 30,
    lastVisibleDoc
  );

  result.datas.map((post) => {
    post.postId = post.id;
    delete post.id;
    return post;
  });

  result.datas = result.datas.filter((post) => {
    return post.state === "published";
  });

  return result;
};

// --------------------------------------- U ---------------------------------------
export const editPost = async (args: EDIT_POST_TYPE) => {
  for (const key in args) {
    if (!args[key]) {
      if (key === "newSeriesId") {
        args.newSeriesId = null;
      } else {
        console.error(`${key} is missing`);
        return false;
      }
    }
  }

  const { postId, originSeriesId, newSeriesId, ...postInfo } = args;

  if (!postId) {
    console.error("postId is necessary info");
    return false;
  }

  const data = {
    ...postInfo,
    editTime: serverTimestamp(),
    seriesId: newSeriesId,
  };

  const result = await updateData(data, "posts", postId);

  if (originSeriesId === newSeriesId) return result;

  if (originSeriesId) {
    updateData({ posts: arrayRemove(postId) }, originSeriesId);
  }

  if (newSeriesId) {
    setData({ posts: arrayUnion(postId) }, newSeriesId);
  }

  return result;
};

export const likeHandler = async (
  postId: string,
  uid?: string,
  isLike?: boolean
) => {
  uid = uid || auth.currentUser?.uid;

  if (!uid) {
    console.error("uid is missing");
    return false;
  }

  return await updateData(
    { likes: isLike === false ? increment(-1) : increment(1) },
    "posts",
    postId
  );
};

// --------------------------------------- D ---------------------------------------
export const deletePost = async (postId: string) => {
  const result = await deleteData("posts", postId);

  return result;
};