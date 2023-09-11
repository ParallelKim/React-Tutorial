import { useRef, useState } from "react";
import cc from "classcat";
import {
    editUserInfo,
    emailLinkLogin,
    facebookLogin,
    getBasicUserInfo,
    getBlogInfoByCustomId,
    getDetailUserInfo,
    getUserInfo,
    getUserInfoByCustomId,
    githubLogin,
    googleLogin,
    logOut,
} from "../api/user";
import { createNewDocId } from "../api/fb/db";
import {
    deletePost,
    getDetailPostByAdress,
    getDetailPostByTitle,
    getPostById,
    getPostsByCustomId,
    getPostsByUid,
    getRecentPage,
    getTrendingPage,
    writePost,
} from "../api/post";
import { colorPicker } from "../const/be-labs";
import { handleImageUpload } from "../api/image";

export const BELabs = () => {
    const ref = useRef<HTMLInputElement>(null);
    const [state, setState] = useState<any>();
    const [imgSrc, setImgSrc] = useState("");

    const writeMockPost = async () => {
        //임시저장이나 출간 시, id를 생성해서 보내야 합니다.
        const newPostId = createNewDocId();
        console.log(newPostId);
        const result = await writePost({
            postId: newPostId,
            title: "이것은제목이다",
            summary: "이것은요약이다",
            content: "이것은내용이다",
            tags: [],
            thumbnail: "hmm",
            state: "hidden",
        });

        if (result) {
            // nav("/어딘가");
        }
    };

    const list: { label: string; onClick: () => void }[] = [
        {
            label: "이메일",
            onClick: () => emailLinkLogin("parallelkim12@gmail.com"),
        },
        {
            label: "구글",
            onClick: googleLogin,
        },
        {
            label: "깃허브 로그인",
            onClick: githubLogin,
        },
        {
            label: "페이스북 로그인",
            onClick: facebookLogin,
        },
        {
            label: "로그아웃",
            onClick: logOut,
        },
        {
            label: "유저 기본 정보",
            onClick: () => console.log(getBasicUserInfo()),
        },
        {
            label: "유저 정보",
            onClick: async () => console.log(await getUserInfo()),
        },
        {
            label: "유저 상세 정보",
            onClick: async () => console.log(await getDetailUserInfo()),
        },
        {
            label: "유저 커스텀 id로 정보 받아오기",
            onClick: async () =>
                console.log(await getUserInfoByCustomId(state)),
        },
        {
            label: "가짜 글 생성",
            onClick: writeMockPost,
        },
        {
            label: "post id로 글 정보 받아오기",
            onClick: async () =>
                console.log(await getPostById("dMckoRI22Rs0cWpqXvBZ")),
        },
        {
            label: "uid로 글목록 받아오기",
            onClick: async () =>
                console.log(await getPostsByUid(getBasicUserInfo()?.uid)),
        },
        {
            label: "custom id로 글목록 받아오기",
            onClick: async () => console.log(await getPostsByCustomId(state)),
        },
        {
            label: "글삭제",
            onClick: () => deletePost(state),
        },
        {
            label: "최신순 데이터",
            onClick: async () => {
                // 1. state의 초기값이 undefined이기 때문에 처음엔 lastVisbleDoc 없이 호출됨
                // 2. lastVisibleDoc 이 설정되면 그 뒤의 문서들을 받아오기 때문에 받아올 문서가 없음
                // 3. 다시 1로 돌아감
                // 4. 단, 기본적으로 limit가 20이기 때문에 문서 개수가 20이 넘으면 다르게 작동할 것 <- 20개 이하로 작동합니다...
                // 5. 먼저 getRecentPage를 써보고 어렵겠다 싶으면 getRecentPosts를 사용해서 전체 페이지를 다 불러오기
                const a = await getRecentPage(state);
                console.log(a);
                setState(a.last);
            },
        },
        {
            label: "트렌딩 데이터",
            onClick: async () => console.log(await getTrendingPage("week")),
        },
        {
            label: "유저 정보 임의로 변경하기",
            onClick: async () =>
                await editUserInfo({
                    profileImage: "https://picsum.photos/200​",
                    email: "test@test.com",
                    name: "변경된 이름",
                    introduction: "변경된 소개",
                    velogTitle: "변경된 벨로그",
                    github: "mock",
                    homepage: "www.google.com",
                    emailNotification: {
                        comment: false,
                        serviceUpdate: true,
                    },
                }),
        },
        {
            label: "유저 블로그에 관한 정보 모두 받아오기",
            onClick: async () =>
                console.log(await getBlogInfoByCustomId("parallelkim")),
        },
        {
            label: "detail post",
            onClick: async () =>
                console.log(
                    await getDetailPostByTitle("parallelkim", "이것은제목이다")
                ),
        },
        {
            label: "adress test",
            onClick: async () =>
                console.log(await getDetailPostByAdress("@zeroung13/asdsd")),
        },
        {
            label: "업로드 테스트",
            onClick: () => ref.current?.click(),
        },
    ];

    return (
        <>
            {
                //style loaders for tailwind
            }
            <div className="bg-red-500" />
            <div className="bg-orange-500" />
            <div className="bg-yellow-500" />
            <div className="bg-green-500" />
            <div className="bg-blue-500" />
            <div className="bg-indigo-500" />
            <div className="bg-purple-500" />
            <div className="bg-pink-500" />

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <input
                    placeholder="input"
                    className={cc([
                        "w-[100px] h-[100px] border-2 border-black",
                    ])}
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                />

                {list.map((item, idx) => {
                    return (
                        <div
                            key={item.label}
                            className={cc([
                                "w-[100px] h-[100px] border-2 border-black",
                                colorPicker(idx),
                            ])}
                            onClick={item.onClick}
                        >
                            {item.label}
                        </div>
                    );
                })}
                {imgSrc && (
                    <img
                        src={imgSrc}
                        className={"w-[100px] h-[100px] border-2 border-black"}
                    />
                )}
            </div>
            <input
                type="file"
                accept="image/*"
                ref={ref}
                style={{ display: "none" }}
                onChange={async (e) => {
                    const file = e.target?.files?.[0];
                    if (file) {
                        const result = await handleImageUpload(
                            file,
                            "testPath"
                        );
                        console.log("IMAGE path:", result);
                        setImgSrc(result ?? "");
                    }
                }}
            />
        </>
    );
};
