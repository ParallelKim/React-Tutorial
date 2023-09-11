import { useEffect } from "react";
import { checkIsEmailLogin } from "../api/user";
import { useNavigate } from "react-router";

export const EmailLogin = () => {
  const nav = useNavigate();
  useEffect(() => {
    checkIsEmailLogin().then((res) => {
      if (res) {
        nav("/be-labs");
      }
    });
  }, []);

  return <div>여기는 이메일 링크 로그인 실험실 입니다.</div>;
};
