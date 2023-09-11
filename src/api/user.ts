import {
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  sendSignInLinkToEmail,
  signOut,
  signInWithEmailLink,
  isSignInWithEmailLink,
  FacebookAuthProvider,
} from "firebase/auth";
import { auth } from "./fb/auth";
import { getData, searchData, setData, updateData } from "./fb/db";
import { USER_INFO_TYPE } from "../types/user";
import { getPostsBySeriesId, getPostsByUid } from "./post";

export const emailLinkLogin = async (email: string) => {
  const actionCodeSettings = {
    url: "http://localhost:5173/emailLogin?email=" + email,
    handleCodeInApp: true,
  };
  // only for dev environment
  console.log("send email to", email);

  const res = await sendSignInLinkToEmail(auth, email, actionCodeSettings)
    .then(() => {
      // The link was successfully sent. Inform the user.
      // Save the email locally so you don't need to ask the user for it again
      // if they open the link on the same device.
      window.localStorage.setItem("emailForSignIn", email);
      console.log("email sent");
      return true;
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;

      console.error("Email link login error occured:", errorCode, errorMessage);
      return false;
    });
  return res;
};

export const checkIsEmailLogin = async () => {
  console.log("check if email login or not");
  if (isSignInWithEmailLink(auth, window.location.href)) {
    console.log("this is email link login");

    let email = window.localStorage.getItem("emailForSignIn");
    if (!email) {
      email = window.prompt("Please provide your email for confirmation") ?? "";
    }

    const res = await signInWithEmailLink(auth, email, window.location.href)
      .then(() => {
        window.localStorage.removeItem("emailForSignIn");
        console.log("email login successed");
        return true;
      })
      .catch((error) => {
        console.error(
          "error occured while email link login",
          error.code,
          error.message
        );
        return false;
      });
    return res;
  } else {
    console.error("this is not email login");
    return false;
  }
};

export const googleLogin = async () => {
  const provider = new GoogleAuthProvider();
  const res = await signInWithPopup(auth, provider)
    .then(() => {
      return true;
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;

      console.error("Google login error occured:", errorCode, errorMessage);
      return false;
    });
  return res;
};

export const githubLogin = async () => {
  const provider = new GithubAuthProvider();

  const res = await signInWithPopup(auth, provider)
    .then(() => {
      return true;
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;

      console.error("Github login error occured:", errorCode, errorMessage);
      return false;
    });
  return res;
};

export const facebookLogin = async () => {
  const provider = new FacebookAuthProvider();

  const res = await signInWithPopup(auth, provider)
    .then(() => {
      return true;
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;

      console.error("Facebook login error occured:", errorCode, errorMessage);
      return false;
    });
  return res;
};

export const logOut = async () => {
  const res = await signOut(auth)
    .then(() => {
      console.log("successfully log outed");
      return true;
    })
    .catch((error) => {
      console.error("log out failed:", error);
      return false;
    });

  return res;
};

export const getBasicUserInfo = () => {
  if (!auth.currentUser) return null;

  const { displayName, email, uid, providerData, photoURL } = auth.currentUser;
  console.log(auth.currentUser);

  const providerDict: { [key: string]: string } = {
    [GoogleAuthProvider.PROVIDER_ID]: "Google",
    [GithubAuthProvider.PROVIDER_ID]: "Github",
    [FacebookAuthProvider.PROVIDER_ID]: "Facebook",
  };
  const extractedProvider = providerData.map(
    (val) => providerDict[val.providerId] ?? "Email"
  );

  return {
    name: displayName,
    email: email,
    uid: uid,
    loginType: extractedProvider,
    profileImage: photoURL,
  };
};

export const getUserInfo = async (uid?: string) => {
  let rtrn = null;

  uid = uid || auth.currentUser?.uid;

  if (!uid) {
    console.error("there is no uid");
    return null;
  }

  rtrn = await getData("user", uid);

  if (!rtrn) {
    console.error("there is no user data for this uid");
    return null;
  }

  const processed: { [key: string]: unknown } = {};

  processed["name"] = (rtrn as { name: unknown })["name"] ?? null;
  processed["email"] = (rtrn as { email: unknown })["email"] ?? null;
  processed["loginType"] =
    (rtrn as { loginType: unknown })["loginType"] ?? null;
  processed["profileImage"] =
    (rtrn as { profileImage: unknown })["profileImage"] ?? null;

  processed["uid"] = uid;

  return processed;
};

export const getDetailUserInfo = async (uid?: string) => {
  let rtrn = null;

  uid = uid || auth.currentUser?.uid;

  if (uid) {
    rtrn = await getData("user", uid);
  } else {
    console.error("there is no uid");
    return null;
  }

  if (!rtrn) {
    console.error("there is no user data for this uid");
  }

  return rtrn;
};

export const getUserInfoByCustomId = async (customId: string) => {
  const rtrn = (await searchData("user", ["customId", "==", customId]))[0];
  rtrn.uid = rtrn.id;
  delete rtrn.id;

  if (!rtrn) {
    console.error("there is no user data for this uid");
  }

  return rtrn;
};

export const getTagsByUserId = async (uid?: string) => {
  uid = uid || auth.currentUser?.uid;

  if (!uid) {
    console.error("there is no uid");
    return null;
  }

  const rtrn = (await searchData("tag", ["uid", "==", uid])) ?? [];
  rtrn.map((tag) => {
    tag.tagId = tag.id;
    delete tag.id;
    return tag;
  });

  if (!rtrn) {
    console.error("there is no user data for this uid");
  }

  return rtrn;
};

export const getBlogInfoByCustomId = async (customId: string) => {
  const rtrn: { [key: string]: unknown } = {};

  const user = await getUserInfoByCustomId(customId);
  if (!user) {
    console.error("there is no user data for this uid");
    return null;
  }

  const series = await searchData("series", ["uid", "==", user.id]);
  series.map((ser) => {
    ser.seriesId = ser.id;
    delete ser.id;
    return ser;
  });
  series.forEach(async (val, idx) => {
    series[idx]["posts"] = await getPostsBySeriesId(val.id);
  });

  const posts = await getPostsByUid(user.id);

  const tags: { [key: string]: number } = {};
  posts.forEach((val) => {
    if (val.tags.length > 0) {
      val.tags.forEach((tag: string) => {
        if (tags[tag]) {
          tags[tag] += 1;
        } else {
          tags[tag] = 1;
        }
      });
    }
  });
  tags["total"] = posts.length;

  rtrn.user = user;
  rtrn.series = series;
  rtrn.posts = posts;
  rtrn.tags = tags;

  return rtrn;
};

export const setUserInfo = async ({ uid, ...rest }: USER_INFO_TYPE) => {
  let rtrn = null;

  const data = rest;

  uid = uid || auth.currentUser?.uid;

  if (uid) {
    rtrn = await setData(data, "user", uid);
  } else {
    console.error("there is no uid");
    return null;
  }

  return rtrn;
};

export const editUserInfo = async ({ uid, ...rest }: USER_INFO_TYPE) => {
  let rtrn = null;

  const data = rest;

  uid = uid || auth.currentUser?.uid;

  if (uid) {
    rtrn = await updateData(data, "user", uid);
  } else {
    console.error("there is no uid");
    return null;
  }

  return rtrn;
};