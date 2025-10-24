interface ProjectData {
    name: string;
    description: string;
    banner: string;
    director: string;
    client: string;
    status: 0 | 1 | 2 | 3; // 0 = 已停止, 1 = 長期營運中, 2 = 籌備中, 3 = 進行中
    link?: string;
    start_at: string;
}

const Projects: Record<string, ProjectData> = {
    "kaobar": {
        name: "會考霸｜KaoBar",
        description: "一個整合會考資源、提供會考線上社群的免費資源整合平台，讓會考生再準備會考時事半功倍！",
        banner: "kaobar.png",
        director: "糖豆魚",
        client: "築夢之地工作室",
        link: "https://kaobar.dreamland-studio.org/",
        status: 1,
        start_at: "2025-01-31",
    },
    "gsatbar": {
        name: "學測霸｜GSATBar",
        description: "",
        banner: "gsatbar.png",
        director: "咖喱 Ryan",
        client: "築夢之地工作室",
        status: 2,
        start_at: "2025-07-02",
    },
    "outbox": {
        name: "OUTBOX｜夢想創造競賽",
        description: "這是一個所有人都能參加的創意競賽，你能使用AI以及你那創意的大腦發揮創意，創造、生成出一個作品並投稿上來，讓我們大家都看看！",
        banner: "outbox.png",
        director: "糖豆魚",
        client: "學生平台專案",
        link: "https://outbox.tw/",
        status: 3,
        start_at: "2025-09-29",
    },
};


export default async function getProject(params: string): Promise<ProjectData | null> {
    // 若找不到對應專案，回傳 null 而不是 undefined
    return Projects[params] ?? null;
}

export function getAllProjects(): ProjectData[] {
  return Object.values(Projects);
}

export function getActiveProjects(): ProjectData[] {
  return Object.values(Projects).filter(p => p.status === 1);
}