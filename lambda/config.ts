
export type Member = {
    id: number;
    parentIssueId?: number | null;
    issueTypeId: number;
    name: string;
}

export const APP_CONFIG: {
    dailyReports: {
        projectId: number;
        members: Member[];
    };
    excludedProjectKeys: string[];
} = {
    dailyReports: {
        projectId: 9999,
        members: [
            {
                name: "岡本秀",
                id: 9999, 
                //parentIssueId: 9999,
                issueTypeId: 9999,
            }
        ]
    },
    // 除外するプロジェクトキー。このキーを持つプロジェクトのアクティビティは収集しない
    excludedProjectKeys: ['DAILY_REPORT'] as string[]
}
