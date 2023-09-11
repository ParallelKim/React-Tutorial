import { getBasicUserInfo, getDetailUserInfo, setUserInfo } from "../api/user";

export const SignFinishPage = () => {
  const fillInfo = () => {
    const basic = getBasicUserInfo();
    const additional = { github: "TEST" };
    setUserInfo({ ...basic, ...additional });
  };
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      여기서 프로필에 필요한 필수 정보들을 채워야 합니다.
      <button onClick={fillInfo}>채웠다 치기</button>
      <button onClick={async () => console.log(await getDetailUserInfo())}>
        자세한 정보
      </button>
    </div>
  );
};
