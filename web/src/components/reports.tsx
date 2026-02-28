import React, { useState } from "react";
import { FaCheck, FaPeoplePulling, FaEye } from "react-icons/fa6";
import { GiTeleport } from "react-icons/gi";
import { fetchNui } from "@/utils/fetchNui";
import { MdOutlineCarRepair, MdOutlineSocialDistance } from "react-icons/md";
import "./App.css";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent } from "./ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from "./ui/dropdown-menu";
import { TbBackpack, TbBinoculars, TbBrandDiscord, TbClipboard, TbClipboardCopy, TbDots, TbId, TbJacket, TbLicense, TbLogout, TbMedicalCrossFilled, TbPackages, TbRibbonHealth, TbSettingsStar, TbSkull, TbUser } from "react-icons/tb";
import { IoCutSharp } from "react-icons/io5";
import { cn } from "@/lib/utils";

export interface message {
    playerName: string;
    playerId: string | number;
    data: string;
    timedate: string;
}

export interface nearestPlayer {
    id: string | number;
    name: string | number;
    distance: string | number;
}

export interface Report {
    id: number | string;
    playerName: string;
    playerId: string;
    playerLicense: string;
    playerDiscord: string;
    type: "Bug" | "Question" | "Gameplay" | "";
    description: string;
    timedate: string;
    title: "";
    nearestPlayers?: nearestPlayer[];
    messages: message[];
    reportId: string;
    // optional tracking for who is currently viewing or has ever seen the report
    viewers?: { id: string | number; name: string }[];
    seenBy?: { id: string | number; name: string }[];
}

const initStateCurrReport: Report = {
    id: 0,
    playerName: "",
    playerId: "",
    playerLicense: "",
    playerDiscord: "",
    type: "",
    description: "",
    timedate: "",
    title: "",
    messages: [],
    reportId: "A1",
};

interface Props {
    reports: Report[];
    myReports: boolean;
}

const adminActions = [
    { id: 1, name: "Goto", icon: <GiTeleport size={14} />, command: "/goto", action: "reportmenu:nuicb:goto" },
    { id: 2, name: "Bring", icon: <FaPeoplePulling size={14} />, command: "/bring", action: "reportmenu:nuicb:bring" },
    { id: 3, name: "Revive", icon: <TbMedicalCrossFilled size={14} />, command: "/revive", action: "reportmenu:nuicb:revive" },
    { id: 4, name: "Heal", icon: <TbRibbonHealth size={14} />, command: "/heal", action: "reportmenu:nuicb:heal" },
    { id: 5, name: "Kill", icon: <TbSkull size={14} />, command: "/kill", action: "reportmenu:nuicb:kill" },
    { id: 6, name: "Spectate", icon: <TbBinoculars size={14} />, command: "/spectate", action: "reportmenu:nuicb:spectate" },
    { id: 7, name: "Inventory", icon: <TbBackpack size={14} />, command: "/pinv", action: "reportmenu:nuicb:inventory" },
    { id: 8, name: "Stash", icon: <TbPackages size={14} />, command: "/stash", action: "reportmenu:nuicb:stash" },
    { id: 9, name: "Fix vehicle", icon: <MdOutlineCarRepair size={14} />, command: "/fix", action: "reportmenu:nuicb:fix" },
    { id: 10, name: "Clothing", icon: <TbJacket size={14} />, command: "/clothingmenu", action: "reportmenu:nuicb:clothing" },
    { id: 11, name: "Outfits", icon: <TbJacket size={14} />, command: "/outfits", action: "reportmenu:nuicb:outfits" },
    { id: 12, name: "Barber", icon: <IoCutSharp size={14} />, command: "/barber", action: "reportmenu:nuicb:barber" },
    { id: 13, name: "Register", icon: <TbSettingsStar size={14} />, command: "/register", action: "reportmenu:nuicb:register" },
    { id: 14, name: "Logout", icon: <TbLogout size={14} />, command: "/logout", action: "reportmenu:nuicb:logout" },
]
const Reports: React.FC<Props> = ({ reports, myReports }) => {
    const [currReport, setCurrReport] = useState<Report>(initStateCurrReport);
    const [modalActive, setModalActive] = useState(false);
    const [messageQuery, setMessageQuery] = useState("");
    const openReport = (report: Report) => {
        setCurrReport(report);
        setModalActive(true);
        // notify server that we're viewing this report
        fetchNui("reportmenu:nuicb:openreport", { reportId: report.reportId });
    }

    // keep the displayed report up to date if the parent list changes (real‑time updates)
    React.useEffect(() => {
        if (modalActive && currReport.reportId) {
            const updated = reports.find((r) => r.reportId === currReport.reportId);
            if (updated) {
                setCurrReport(updated);
            }
        }
    }, [reports, modalActive, currReport.reportId]);

    return (
        <>
            <div className="w-full h-full overflow-auto bg-black/10 rounded-xl">
                <div className="grid grid-cols-1 m-5 sm:grid-cols-2 gap-4 md:grid-cols-3">
                    {reports.length !== 0 ? (
                        <>
                            {reports.map((report) => {
                                if (!report) return console.log("[DEBUG] (Reports/map) report is null");
                                return (
                                    <div
                                        key={report.reportId}
                                        onClick={() => openReport(report)}
                                        className="cursor-pointer group flex flex-col justify-between p-4 h-24 bg-background border border-secondary rounded-lg hover:bg-secondary/50 transition"
                                    >
                                        {report.seenBy && report.seenBy.length > 0 && (
                                            <FaEye className="absolute top-2 right-2 text-green-400" />
                                        )}
                                        <div className="flex items-center">
                                            <div className="flex gap-1 items-center">
                                                <span className="text-xs rounded-lg text-white bg-[rgba(var(--accent-rgb),0.12)] border border-[rgba(var(--accent-rgb),0.35)] px-2 py-[2px]">{report.reportId}</span>
                                                <span className="font-semibold truncate">
                                                    {report.title || "(no title)"}
                                                </span>
                                            </div>
                                            <span className="ml-auto text-xs px-2 py-0.5 rounded bg-accent text-accent-foreground">
                                                {report.type || "Unknown"}
                                            </span>
                                        </div>
                                        {report.viewers && report.viewers.length > 0 && (
                                            <div className="text-xs text-green-400">
                                                Viewing: {report.viewers.length}
                                            </div>
                                        )}
                                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                                            <span className="mx-1 truncate flex-1">{report.playerName}</span>
                                            <span className="opacity-60">{report.timedate}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    ) : (
                        <>
                            <div className="font-main">
                                {myReports ? "You have no active reports." : "No Reports available."}
                            </div>
                        </>
                    )}
                </div>
            </div>
            <Dialog
                open={modalActive}
                onOpenChange={(state) => {
                    if (!state && currReport?.reportId) {
                        fetchNui("reportmenu:nuicb:closereport", { reportId: currReport.reportId });
                    }
                    setModalActive(state);
                    if (!state) setCurrReport(initStateCurrReport);
                }}
            >
                <DialogContent className="bg-black/80 rounded-2xl">
                    <div className="flex flex-col gap-1 justify-center rounded-2xl  bg-black/20">
                        <div className="flex m-2 font-main text-white">
                            <p>{currReport.title}</p>
                            <div className="ml-auto flex gap-2 justify-center items-center">
                                <p className="bg-[rgba(var(--accent-rgb),0.12)] border border-[rgba(var(--accent-rgb),0.35)] rounded-lg p-1 px-3 text-sm">{currReport.reportId}</p>
                                <p className="bg-[rgba(var(--accent-rgb),0.18)] border border-[rgba(var(--accent-rgb),0.45)] rounded-lg p-1 px-3 text-sm">{currReport.type}</p>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button className="bg-black/0 rounded-2xl outline-none focus-within:outline-none">
                                            <TbDots />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" side="bottom" className="bg-background">
                                        {!myReports && (
                                            <>
                                                <DropdownMenuLabel>Player Zone</DropdownMenuLabel>
                                                {adminActions.map((action) => (
                                                    <DropdownMenuItem
                                                        key={action.id}
                                                        onClick={() => {
                                                            fetchNui(action.action, currReport);
                                                            setCurrReport(initStateCurrReport);
                                                            setModalActive(false);
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {action.icon}
                                                            <span>{action.name}</span>
                                                            <span className="ml-auto text-xs opacity-60">{action.command}</span>
                                                        </div>
                                                    </DropdownMenuItem>
                                                ))}
                                            </>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                        <div className="rounded py-1 px-2 flex flex-col gap-2 justify-center">
                            <div className="flex gap-2 items-center justify-between">
                                <div className="flex gap-2 items-center">
                                    <p className="text-white text-xs font-main flex gap-2 items-center"><TbUser />  Player Name:</p>
                                    <p className="font-main text-xs">{currReport.playerName}</p>
                                </div>
                                <TbClipboardCopy />
                            </div>
                            <div className="flex gap-2 items-center justify-between">
                                <div className="flex gap-2 items-center">
                                    <p className="text-white text-xs font-main flex gap-2 items-center"><TbId /> Player ID:</p>
                                    <p className="font-main text-xs">{currReport.playerId}</p>
                                </div>
                                <TbClipboardCopy />
                            </div>
                            <div className="flex gap-2 items-center justify-between">
                                <div className="flex gap-2 items-center">
                                    <p className="text-white text-xs font-main flex gap-2 items-center"> <TbBrandDiscord /> Player Discord:</p>
                                    <p className="font-main text-xs">{currReport.playerDiscord}</p>
                                </div>
                                <TbClipboardCopy />
                            </div>
                            <div className="flex gap-2 items-center justify-between">
                                <div className="flex gap-2 items-center">
                                    <p className="text-white text-xs font-main flex gap-2 items-center"> <TbLicense /> Player License:</p>
                                    <p className="font-main text-xs">{currReport.playerLicense?.replace('license:', '')}</p>
                                </div>
                                <TbClipboardCopy />
                            </div>
                            <div className="border p-2 rounded-lg text-sm px-2">
                                <p className="text-xs rounded-lg w-fit mb-2 text-white bg-[rgba(var(--accent-rgb),0.12)] border border-[rgba(var(--accent-rgb),0.35)] px-2 py-[2px]">Message</p>
                                <div className="ps-2 pb-2">
                                    {currReport.description}
                                </div>
                            </div>

                            {currReport.viewers && currReport.viewers.length > 0 && (
                                <p className="text-white font-main mt-1">
                                    <span className="font-bold">Currently viewing:</span> {currReport.viewers.map(v => v.name).join(", ")}
                                </p>
                            )}
                            {currReport.seenBy && currReport.seenBy.length > 0 && (
                                <p className="text-white font-main text-xs opacity-70">
                                    <span className="font-bold">Seen by:</span> {currReport.seenBy.map(v => v.name).join(", ")}
                                </p>
                            )}

                            {currReport.messages && (
                                <>
                                    <p className="text-white font-main">
                                        Report Messages
                                    </p>
                                    <div className="h-[20dvh] overflow-auto bg-background border-[2px]">
                                        <div className="flex flex-col">
                                            {currReport.messages.map(
                                                (message, index) => (
                                                    <div
                                                        key={`${message.playerId}-${message.timedate}-${index}`}
                                                        className={cn(
                                                            "bg-secondary py-1 px-2 m-0.5 rounded-[2px]",
                                                            message.playerId === currReport.playerId ? 'bg-white/10' : 'bg-emerald-950'
                                                        )}
                                                    >
                                                        <div className="flex flex-col font-main">
                                                            <div className="flex justify-between items-center">
                                                                <p className="text-white text-xs">
                                                                    [{String(message.playerId).padStart(4, '0')}] - {message.playerName}:
                                                                </p>
                                                                <p className="ml-auto bg-background px-2 flex justify-center items-center gap-1 border-[2px] font-main opacity-50 text-xs">
                                                                    {message.timedate}
                                                                </p>
                                                            </div>
                                                            <p className="ml-1 max-w-[240px] break-words text-xs">
                                                                {message.data}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}

                            {!!currReport.nearestPlayers && currReport.nearestPlayers?.length > 0 && (
                                <>
                                    <p className="text-white font-main">
                                        Nearest Players
                                    </p>
                                    <div className="max-h-[30dvh] overflow-auto bg-background border-[2px]">
                                        <div className="py-4 px-4 rounded-[2px] flex gap-1 font-mwwwwwwwwwwwain text-sm">
                                            {currReport.nearestPlayers.length > 0 &&
                                                currReport.nearestPlayers.map(
                                                    (player, index) => (
                                                        <div
                                                            key={`${player.id}-${index}`}
                                                            className="bg-secondary py-1 px-2 flex items-center gap-2"
                                                        >
                                                            <div className="flex items-center text-white text-xs">
                                                                <p className="ml-1">{player.id} - {player.name}</p>
                                                            </div>
                                                            <p className="ml-auto flex items-center bg-background rounded-[2px] px-1">
                                                                <MdOutlineSocialDistance className="mr-1" />{" "}
                                                                {player.distance}
                                                            </p>
                                                        </div>
                                                    )
                                                )}
                                        </div>
                                    </div>
                                </>
                            )}
                            <form
                                className="flex items-center gap-1 mt-2"
                                onSubmit={(e) => {
                                    e.preventDefault();

                                    const data = {
                                        report: currReport,
                                        messageQuery: messageQuery,
                                    };

                                    fetchNui("reportmenu:nuicb:sendmessage", data);
                                    if (currReport?.reportId) {
                                        fetchNui("reportmenu:nuicb:closereport", { reportId: currReport.reportId });
                                    }
                                    setModalActive(false);
                                    setCurrReport(initStateCurrReport);
                                    setMessageQuery("");
                                }}
                            >
                                <Input
                                    className="w-full"
                                    value={messageQuery}
                                    onChange={(e) => {
                                        setMessageQuery(e.target.value);
                                    }}
                                    placeholder="Message..."
                                />
                                <Button
                                    type="submit"
                                    className="border-[2px] p-4 rounded-[2px] bg-background h-[36px] text-white"
                                >
                                    <FaCheck size={16} strokeWidth={2.5} />
                                </Button>
                            </form>
                            <Button
                                className="flex gap-2"
                                onClick={() => {
                                    const data = {
                                        ...currReport,
                                        isMyReportsPage: myReports,
                                    };

                                    fetchNui("reportmenu:nuicb:delete", data);
                                    if (currReport?.reportId) {
                                        fetchNui("reportmenu:nuicb:closereport", { reportId: currReport.reportId });
                                    }
                                    setModalActive(false);
                                    setCurrReport(initStateCurrReport);
                                }}>
                                <FaCheck size={14} />
                                {myReports ? "Close" : "Conclude"} Report
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default Reports;
