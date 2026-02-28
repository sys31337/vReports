import { Divider, SegmentedControl, Switch, Transition } from "@mantine/core";
import React, { useEffect, useMemo, useState } from "react";
import { FaShieldCat } from "react-icons/fa6";
import { MdBugReport } from "react-icons/md";
import { TbMessageReportFilled } from "react-icons/tb";
import { Toaster, toast } from "sonner";
import { useNuiEvent } from "../hooks/useNuiEvent";
import { debugData } from "../utils/debugData";
import { fetchNui } from "../utils/fetchNui";
import { isEnvBrowser } from "../utils/misc";
import { applyTheme } from "../utils/utils";
import "./App.css";
import ReportModal from "./reportModal";
import Reports, { Report } from "./reports";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import TopLogo from "./TopLogo";
import { Bell, BellOff, RefreshCw } from "lucide-react";

debugData([
    {
        action: "setVisible",
        data: {
            visible: true,
            accentColor: "#10b981",
        },
    },
]);

export interface reportData {
    title: string;
    type: "Question" | "Bug" | "Gameplay";
    description: string;
    reportNearestPlayers: boolean;
}

const initialReportData: reportData = {
    title: "",
    type: "Gameplay",
    description: "",
    reportNearestPlayers: false,
};

export interface playerData {
    name: string;
    id: string | number;
    identifiers: string[];
    isStaff: boolean;
}

const initialPlayerData: playerData = {
    name: "vipex",
    id: "1",
    identifiers: ["hey", "hey2"],
    isStaff: true,
};

export interface UserSettings {
    notifications: boolean;
}

interface notifyData {
    title: string;
    description: string;
    appearOnlyWhenNuiNotOpen?: boolean;
}

type ToasterProps = React.ComponentProps<typeof Toaster>;

export interface ScriptConfig {
    Debug: boolean;
    UseDiscordRoles: boolean;
    AcePerm: string;
    MaxDistance: number;
    RoleIDs: Record<string, boolean>;
    ReportCommand: string;
    ReportMenuCommand: string;
    NotificationPos: ToasterProps["position"];
    Title: string;
}

type ThemeData = {
    accentColor?: string;
};

type VisibilityPayload = ThemeData & {
    visible?: boolean;
};

const App: React.FC = () => {
    const normalizeReports = (value: Report[] | Record<string, Report> | null | undefined): Report[] => {
        if (!value) return [];
        if (Array.isArray(value)) {
            return value.filter((entry): entry is Report => Boolean(entry && typeof entry === "object" && "reportId" in entry));
        }

        return Object.values(value).filter(
            (entry): entry is Report => Boolean(entry && typeof entry === "object" && "reportId" in entry)
        );
    };

    const [visible, setVisible] = useState(false);
    const [playerData, setPlayerData] = useState<playerData>(initialPlayerData);
    const [currentTab, setCurrentTab] = useState(playerData.isStaff ? "reports" : "myreports");
    const [reportMenuVisible, setReportMenuVisible] = useState(isEnvBrowser());
    const [reportData, setReportData] = useState<reportData>(initialReportData);
    const [activeReports, setActiveReports] = useState<Report[]>([]);
    const [devInjected, setDevInjected] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [myReports, setMyReports] = useState<Report[]>([]);
    const [scriptConfig, setScriptConfig] = useState<ScriptConfig>({
        Debug: true,
        UseDiscordRoles: true,
        AcePerm: "vadmin.staff",
        MaxDistance: 20.0,
        RoleIDs: {
            "839129247918194732": true,
        },
        ReportCommand: "report",
        ReportMenuCommand: "reports",
        NotificationPos: "top-center",
        Title: "DC Roleplay",
    });

    const [userSettings, setUserSettings] = useState<UserSettings>({ notifications: true });

    const refreshReports = async () => {
        await fetchNui("reportmenu:nuicb:refresh");
    };

    const reportsForCurrentTab = useMemo(
        () => (currentTab === "reports" ? activeReports : myReports),
        [activeReports, currentTab, myReports]
    );

    const filteredReports = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return reportsForCurrentTab;

        return reportsForCurrentTab.filter((report) => {
            if (!report) return false;
            const reportPlayerId = report.id?.toString().toLowerCase() ?? "";
            const reportPlayerName = report.playerName?.toLowerCase() ?? "";
            const reportTitle = report.title?.toLowerCase() ?? "";
            const reportTimeDate = report.timedate?.toLowerCase() ?? "";
            const reportType = report.type?.toLowerCase() ?? "";

            return (
                reportPlayerId.includes(query) ||
                reportPlayerName.includes(query) ||
                reportTitle.includes(query) ||
                reportTimeDate.includes(query) ||
                reportType.includes(query)
            );
        });
    }, [reportsForCurrentTab, searchQuery]);

    useNuiEvent("nui:state:playerdata", setPlayerData);
    useNuiEvent<Report[] | Record<string, Report> | ThemeData>("nui:state:myreports", (reports) => {
        if (typeof reports === "object" && reports && "accentColor" in reports && typeof reports.accentColor === "string") {
            applyTheme(reports.accentColor);
        }

        setMyReports(normalizeReports(reports as Report[] | Record<string, Report>));
    });
    useNuiEvent<boolean | VisibilityPayload>("nui:state:reportmenu", (payload) => {
        if (typeof payload === "object" && payload) {
            if (payload.accentColor) {
                applyTheme(payload.accentColor);
            }
            setReportMenuVisible(Boolean(payload.visible));
            return;
        }

        setReportMenuVisible(Boolean(payload));
    });
    useNuiEvent<Report[] | Record<string, Report> | ThemeData>("nui:state:reports", (reports) => {
        if (typeof reports === "object" && reports && "accentColor" in reports && typeof reports.accentColor === "string") {
            applyTheme(reports.accentColor);
        }

        setActiveReports(normalizeReports(reports as Report[] | Record<string, Report>));
    });

    // inject dummy data when running in browser for development previews
    useEffect(() => {
        if (!devInjected && isEnvBrowser()) {
            setDevInjected(true);
            const sample: Report = {
                id: 1,
                playerName: "DevTester",
                playerId: "123",
                playerLicense: "license:ABC123ABC123ABC123ABC123ABC123ABC123ABC123",
                playerDiscord: "dev#0001",
                type: "Gameplay",
                description: "This is a sample report shown in dev mode. It contains all properties for debugging UI.",
                timedate: new Date().toLocaleString(),
                title: "",
                messages: [
                    { playerName: "StaffOne", playerId: "2", data: "Checking into issue.", timedate: new Date().toLocaleString() },
                    { playerName: "DevTester", playerId: "123", data: "Thanks, let me know.", timedate: new Date().toLocaleString() }
                ],
                nearestPlayers: [
                    { id: 45, name: "NearbyPlayer", distance: 4 },
                    { id: 78, name: "SecondPlayer", distance: 11 }
                ],
                reportId: "D1",
                viewers: [{ id: 2, name: "StaffOne" }],
                seenBy: [{ id: 2, name: "StaffOne" }, { id: 3, name: "StaffTwo" }],
            };
            setActiveReports([sample]);
            setMyReports([sample]);
        }
    }, [devInjected]);
    useNuiEvent("nui:state:settings", setUserSettings);
    useNuiEvent<ScriptConfig & ThemeData>("nui:state:scriptconfig", (data) => {
        if (data?.accentColor) {
            applyTheme(data.accentColor);
        }
        setScriptConfig(data);
    });
    useNuiEvent("nui:resetstates", () => {
        setSearchQuery("");
    });
    useNuiEvent<boolean | VisibilityPayload>("setVisible", (payload) => {
        if (typeof payload === "object" && payload) {
            if (payload.accentColor) {
                applyTheme(payload.accentColor);
            }
            setVisible(Boolean(payload.visible));
            return;
        }

        setVisible(Boolean(payload));
    });
    useNuiEvent<notifyData>("nui:notify", (data) => {
        if (
            !userSettings.notifications ||
            (data.appearOnlyWhenNuiNotOpen && visible)
        )
            return;
        toast.success(data.title, {
            description: data.description,
            classNames: {
                toast: "font-main !bg-background !border !border-[2px] !rounded-[8px]",
                default: "rounded-[2px] bg-background border-[2px]",
            },
        });
    });

    useEffect(() => {
        if (!visible) return;

        const keyHandler = (e: KeyboardEvent) => {
            if (["Escape"].includes(e.code)) {
                if (!isEnvBrowser()) fetchNui("hideFrame");
                else setVisible(!visible);
            }
        };

        window.addEventListener("keydown", keyHandler);

        return () => window.removeEventListener("keydown", keyHandler);
    }, [visible]);

    return (
        <>
            <Transition mounted={visible} transition={"fade-up"} duration={200}>
                {(styles) => (
                    <>
                        <div className="flex w-[100dvw] h-[100dvh] justify-center items-center">
                            <div
                                className="min-w-[50dvw] min-h-[35dvw] relative m-auto overflow-hidden bg-black/80 bg-cover bg-blend-hard-light opacity-100 transition-all duration-300 rounded-2xl"
                                style={styles}
                            >
                                <div className="flex items-center justify-between z-50 pe-6">
                                    <h1 className="m-2 gap-[5px] relative flex justify-center bg-black/80 items-center rounded-lg font-main text-white p-5 py-2">
                                        <FaShieldCat size={18} className="text-primary mb-[1px]" />
                                        <TopLogo title={scriptConfig.Title} />
                                    </h1>
                                    <Switch
                                        size="lg"
                                        color="var(--mantine-color-green-6)"
                                        onLabel={<Bell size={16} color="var(--mantine-color-white)" />}
                                        offLabel={<BellOff size={16} color="var(--mantine-color-green-6)" />}
                                        checked={userSettings.notifications}
                                        onChange={(e) => {
                                            setUserSettings({ notifications: e.target.checked });
                                            const settings = { notifications: e.target.checked };
                                            setUserSettings(settings);
                                            fetchNui("reportmenu:nui:cb:settings", settings);
                                        }} />
                                </div>

                                <Divider size="xs" />

                                <div className="flex relative items-center justify-center m-5">
                                    <SegmentedControl
                                        className="bg-black/20 rounded-3xl"
                                        value={currentTab}
                                        onChange={setCurrentTab}
                                        classNames={{
                                            indicator: "bg-[rgba(var(--accent-rgb),0.12)] border border-[rgba(var(--accent-rgb),0.45)] rounded-full",
                                            label: "font-medium",
                                        }}
                                        data={[
                                            {
                                                value: "reports",
                                                disabled: !playerData.isStaff,
                                                label: (
                                                    <div className="flex justify-center items-center gap-1 text-white">
                                                        <TbMessageReportFilled size={18} className="text-primary mt-[3px]" />
                                                        Reports
                                                    </div>
                                                ),
                                            },
                                            {
                                                value: "myreports",
                                                label: (
                                                    <div className="flex justify-center items-center gap-1 text-white">
                                                        <MdBugReport size={18} className="text-primary mt-[3px]" />
                                                        My Reports
                                                    </div>
                                                ),
                                            },
                                        ]}
                                    />
                                    <div className="absolute right-0 top-0 h-full flex items-center justify-center">
                                        {playerData.isStaff && currentTab === "reports" && (
                                            <Button
                                                type="button"
                                                onClick={refreshReports}
                                                className="h-10 mr-2 px-3 text-white"
                                            >
                                                <RefreshCw size={14} className="mr-1" />
                                                Refresh
                                            </Button>
                                        )}
                                        <Input
                                            type="text"
                                            className="outline-none w-full font-main text-sm border border-secondary-foreground] bg-black/20 hover:bg-black/30 hover: ml-auto p-5 px-4 rounded-xl transition-all focus:ring-0 focus:border-0"
                                            placeholder="Search..."
                                            onChange={(e) => { setSearchQuery(e.target.value) }}
                                        />
                                    </div>
                                </div>
                                <div className="border-[1px] flex justify-center items-center h-[55dvh] w-[55dvw] rounded-[8px] m-5">
                                    <Reports
                                        reports={filteredReports}
                                        myReports={
                                            currentTab === "reports"
                                                ? false
                                                : true
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </Transition>

            <ReportModal
                // @ts-expect-error BEGONE
                reportMenuVisible={reportMenuVisible}
                reportData={reportData}
                setReportData={setReportData}
                setReportMenuVisible={setReportMenuVisible}
            />
            <Toaster theme="dark" position={scriptConfig.NotificationPos} />
        </>
    );
};

export default App;
