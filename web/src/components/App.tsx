import { Divider, SegmentedControl, Switch, Transition } from "@mantine/core";
import React, { useEffect, useState, useCallback } from "react";
import { FaShieldCat } from "react-icons/fa6";
import { MdBugReport } from "react-icons/md";
import { TbMessageReportFilled } from "react-icons/tb";
import { Toaster, toast } from "sonner";
import debounce from "debounce";
import { useNuiEvent } from "../hooks/useNuiEvent";
import { debugData } from "../utils/debugData";
import { fetchNui } from "../utils/fetchNui";
import { isEnvBrowser } from "../utils/misc";
import "./App.css";
import ReportModal from "./reportModal";
import Reports, { Report } from "./reports";
import { Input } from "./ui/input";
import TopLogo from "./TopLogo";
import { Bell, BellOff } from "lucide-react";

debugData([
    {
        action: "setVisible",
        data: true,
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
    UseDiscordRestAPI: boolean;
    AcePerm: string;
    MaxDistance: number;
    RoleIDs: Record<string, boolean>;
    ReportCommand: string;
    ReportMenuCommand: string;
    NotificationPos: ToasterProps["position"];
}

const App: React.FC = () => {
    const [visible, setVisible] = useState(false);
    const [playerData, setPlayerData] = useState<playerData>(initialPlayerData);
    const [currentTab, setCurrentTab] = useState(playerData.isStaff ? "reports" : "myreports");
    const [reportMenuVisible, setReportMenuVisible] = useState(isEnvBrowser());
    const [reportData, setReportData] = useState<reportData>(initialReportData);
    const [activeReports, setActiveReports] = useState<Report[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredReports, setFilteredReports] = useState<Report[]>([]);
    const [myReports, setMyReports] = useState<Report[]>([]);
    const [scriptConfig, setScriptConfig] = useState<ScriptConfig>({
        Debug: true,
        UseDiscordRestAPI: true,
        AcePerm: "vadmin.staff",
        MaxDistance: 20.0,
        RoleIDs: {
            "839129247918194732": true,
        },
        ReportCommand: "report",
        ReportMenuCommand: "reports",
        NotificationPos: "top-center",
    });

    const [userSettings, setUserSettings] = useState<UserSettings>({ notifications: true });
    const [loading, setLoading] = useState(false);

    const debouncedSearch = useCallback(
        debounce((query: string) => {
            const filterPlayers = (data: Report[], query: string) => {
                return data
                    ? Object.values(data).filter((report) => {
                        if (!report) return;
                        const lowerQuery = query.toLowerCase();
                        const reportPlayerId = report.id
                            ?.toString()
                            .toLowerCase();
                        const reportPlayerName =
                            report.playerName.toLowerCase();
                        const reportTitle = report.title.toLowerCase();
                        const reportTimeDate = report.timedate.toLowerCase();
                        const reportType = report.type.toLowerCase();

                        return (
                            reportPlayerId.includes(lowerQuery) ||
                            reportPlayerName.includes(lowerQuery) ||
                            reportTitle.includes(lowerQuery) ||
                            reportTimeDate.includes(lowerQuery) ||
                            reportType.includes(lowerQuery)
                        );
                    })
                    : [];
            };

            setFilteredReports(
                filterPlayers(
                    currentTab === "reports" ? activeReports : myReports,
                    query
                )
            );
            setLoading(false);
        }, 300),
        [activeReports, currentTab, myReports]
    );

    useEffect(() => {
        setLoading(true); // Start loading when searchQuery changes
        debouncedSearch(searchQuery);
    }, [searchQuery, debouncedSearch]);

    useNuiEvent("nui:state:playerdata", setPlayerData);
    useNuiEvent("nui:state:myreports", setMyReports);
    useNuiEvent("nui:state:reportmenu", setReportMenuVisible);
    useNuiEvent("nui:state:reports", setActiveReports);
    useNuiEvent("nui:state:settings", setUserSettings);
    useNuiEvent("nui:state:scriptconfig", setScriptConfig);
    useNuiEvent("nui:resetstates", () => {
        setSearchQuery("");
    });
    useNuiEvent<boolean>("setVisible", setVisible);
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
                                className="min-w-[50dvw] min-h-[35dvw] relative m-auto overflow-hidden bg-gray-900 bg-[url(images/background.webp)] bg-cover bg-blend-hard-light opacity-100 transition-all duration-300 rounded-2xl"
                                style={styles}
                            >
                                <div className="absolute -z-10 inset-0 overflow-hidden">
                                    <div className="absolute z-0 top-0 left-0 w-full h-full bg-gradient-to-br from-green-900/30 to-emerald-900/30"></div>
                                    <div className="absolute z-0 top-1/4 left-1/4 w-64 h-64 rounded-full bg-green-500/10 blur-3xl animate-pulse"></div>
                                    <div className="absolute z-0 bottom-1/3 right-1/4 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl animate-pulse delay-300"></div>
                                    <div className="absolute z-0 top-1/3 right-1/3 w-48 h-48 rounded-full bg-green-500/10 blur-2xl animate-pulse delay-700"></div>
                                    <div className="absolute z-0 inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                                </div>
                                <div className="flex items-center justify-between z-50 pe-6">
                                    <h1 className="m-2 gap-[5px] relative flex justify-center bg-black/80 items-center rounded-lg font-main text-white p-5 py-2">
                                        <FaShieldCat size={18} className="text-primary mb-[1px]" />
                                        <TopLogo />
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
                                        className="backdrop-filter backdrop-blur-xl bg-black/20 rounded-3xl"
                                        value={currentTab}
                                        onChange={setCurrentTab}
                                        classNames={{ indicator: "bg-black/80 rounded-full", label: "font-medium" }}
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
                                        <Input
                                            type="text"
                                            className="outline-none w-full font-main text-sm border border-secondary-foreground] bg-black/20 hover:bg-black/30 hover: ml-auto p-5 px-4 rounded-xl transition-all focus:ring-0 focus:border-0"
                                            placeholder="Search..."
                                            onChange={(e) => { setSearchQuery(e.target.value) }}
                                        />
                                    </div>
                                </div>
                                <div className="border-[1px] flex justify-center items-center h-[55dvh] w-[55dvw] rounded-[8px] m-5">
                                    {loading ? (
                                        <div className="text-center">
                                            Loading...
                                        </div>
                                    ) : (
                                        <Reports
                                            reports={
                                                !searchQuery
                                                    ? currentTab === "reports"
                                                        ? activeReports
                                                        : myReports
                                                    : filteredReports
                                            }
                                            myReports={
                                                currentTab === "reports"
                                                    ? false
                                                    : true
                                            }
                                        />
                                    )}
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
